import * as mysql from "mysql2";
import * as uuid from "uuid/v4";

import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { PersistenceOptions } from "./decorators/Persistent";
import { FieldOptions } from "./decorators/Field";

import { getPersistentMetadata } from "./services/meta";
import { DatabaseEntity } from "./DatabaseEntity";

interface QueryOptions {
  connection: DatabaseConnection;
  inTransaction: boolean;
  logQueriesToConsole: boolean;
}

interface FindOptions {
  connection?: DatabaseConnection;
  logQueriesToConsole?: boolean;
  include: ComponentClass<Component>[];
  exclude: ComponentClass<Component>[];
}

interface DatabaseOptions extends mysql.PoolOptions {
  logQueriesToConsole?: boolean;
}

class DatabaseConnection {
  private readonly _connection: mysql.PoolConnection;
  private _inTransaction: boolean;
  private _closed: boolean;
  public logQueriesToConsole: boolean;

  constructor(connection: mysql.PoolConnection) {
    this._connection = connection;
    this._inTransaction = false;
    this._closed = false;
    this.logQueriesToConsole = false;
  }

  query(
    query: string,
    params: any[] | null = null
  ): Promise<
    | mysql.RowDataPacket
    | mysql.OkPacket
    | mysql.RowDataPacket[]
    | mysql.OkPacket[]
    | mysql.RowDataPacket[][]
  > {
    const error = new Error("Connection is closed");
    return new Promise((resolve, reject) => {
      if (this._closed) return reject(error);
      if (this.logQueriesToConsole) {
        console.log(query);
      }
      if (params) {
        return this._connection.query(query, params, (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      }
      this._connection.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  async nestedTransaction(callback: () => Promise<any>) {
    const inTransaction = this.inTransaction;
    if (!inTransaction) {
      this.beginTransaction();
    }
    try {
      await callback();
      if (!inTransaction) {
        await this.commit();
      }
    } catch (e) {
      if (!inTransaction) {
        await this.rollback();
      }
      throw e;
    }
  }

  beginTransaction(): Promise<void> {
    const error = new Error("Connection is closed");
    this._inTransaction = true;
    return new Promise((resolve, reject) => {
      if (this._closed) return reject(error);
      this._connection.beginTransaction(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  commit(): Promise<void> {
    this._inTransaction = false;
    const error = new Error("Connection is closed");
    return new Promise((resolve, reject) => {
      if (this._closed) return reject(error);
      this._connection.commit(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  rollback(): Promise<void> {
    this._inTransaction = false;
    const error = new Error("Connection is closed");
    return new Promise((resolve, reject) => {
      if (this._closed) return reject(error);
      this._connection.rollback(resolve);
    });
  }

  async close() {
    if (this._inTransaction) {
      this._inTransaction = false;
      await this.rollback();
    }
    this._connection.release();
    this._closed = true;
  }

  release() {
    return this.close();
  }

  get inTransaction() {
    return this._inTransaction;
  }
}

class Database {
  static readonly FIND_ALL: FindOptions = { include: [], exclude: [] };

  private readonly _models: PersistenceOptions[];
  private readonly _modelsByTable: {
    [table: string]: PersistenceOptions;
  };
  private readonly _componentClassesByTable: {
    [table: string]: ComponentClass<Component>;
  };
  private readonly _entitiesTable: string;
  private readonly pool: mysql.Pool;
  public logQueriesToConsole: boolean;

  constructor(options: DatabaseOptions) {
    this._models = [];
    this._entitiesTable = "entities";
    this._modelsByTable = {};
    this._componentClassesByTable = {};
    const { logQueriesToConsole, ...poolOptions } = options;
    this.logQueriesToConsole = !!logQueriesToConsole;
    this.pool = mysql.createPool(poolOptions);
  }

  connect(): Promise<DatabaseConnection> {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) return reject(err);
        resolve(new DatabaseConnection(connection));
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.end(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async sync(options: Partial<QueryOptions> = {}) {
    const connection = options.connection || (await this.connect());
    connection.logQueriesToConsole = !!options.logQueriesToConsole;
    await connection.nestedTransaction(async () => {
      await this._createEntitiesTable(connection);
      await this._createModelTables(connection);
    });
    if (!options.connection) {
      await connection.release();
    }
  }

  private async _createEntitiesTable(connection: DatabaseConnection) {
    await connection.query(`CREATE TABLE IF NOT EXISTS ${this._entitiesTable} ( 
      \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
      \`component_list\` TEXT NOT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT NOW(),
      \`updated_at\` DATETIME NOT NULL DEFAULT NOW()
    )`);
  }

  private async _createModelTables(connection: DatabaseConnection) {
    for (let model of this._models) {
      await this._createComponentTable(connection, model);
    }
  }

  private async _createComponentTable(
    connection: DatabaseConnection,
    model: PersistenceOptions
  ) {
    await connection.query(`CREATE TABLE IF NOT EXISTS ${model.tableName} ( 
      ${this._mapModelFields(model.fields)}
    )`);
  }

  private _mapModelFields(fields: { [name: string]: FieldOptions }) {
    const result = [
      "`entity_id` VARCHAR(36) NOT NULL PRIMARY KEY",
      "`created_at` DATETIME NOT NULL DEFAULT NOW()",
      "`updated_at` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()"
    ];
    for (let name of Object.keys(fields)) {
      let options = fields[name];
      result.push(this._mapModelField(name, options));
    }
    result.push(
      `FOREIGN KEY (\`entity_id\`) REFERENCES ${
        this._entitiesTable
      }(\`id\`) ON UPDATE CASCADE ON DELETE CASCADE`
    );
    return result.join(",");
  }

  private _mapModelField(name: string, options: FieldOptions) {
    const isNull = options.allowNull ? "" : "NOT NULL";
    const defaultValue = options.allowNull ? "DEFAULT NULL" : "";
    return `${name} ${options.type.db} ${isNull} ${defaultValue}`;
  }

  async save(entity: Entity, options: Partial<QueryOptions> = {}) {
    if (entity.isNew()) {
      const newEntity = await this.create(options);
      entity.id = newEntity.id;
    }
    return await this.update(entity, options);
  }

  async update(entity: Entity, options: Partial<QueryOptions> = {}) {
    if (entity.isNew()) {
      throw new Error("Entity cannot be new to update.");
    }
    const connection = options.connection || (await this.connect());
    connection.logQueriesToConsole = !!options.logQueriesToConsole;
    await connection.nestedTransaction(async () => {
      const components = entity.listComponentsWithTypes();
      for (let { type, component } of components) {
        let meta = getPersistentMetadata(type.prototype);
        if (meta) {
          await this._updateInDatabase(connection, meta, entity, component);
        }
      }
      const componentList = JSON.stringify(
        components
          .map(c => {
            let meta = getPersistentMetadata(c.type.prototype);
            if (!meta) {
              return null;
            }
            return meta.tableName;
          })
          .filter(i => i !== null)
      );
      await connection.query(
        `UPDATE ${
          this._entitiesTable
        } SET updated_at=NOW(), component_list=? WHERE id=?`,
        [componentList, entity.id]
      );
    });
    if (!options.connection) {
      await connection.release();
    }
    return entity;
  }

  private async _updateInDatabase(
    connection: DatabaseConnection,
    meta: PersistenceOptions,
    entity: Entity,
    component: Component
  ) {
    const tableName = meta.tableName;
    if (!tableName) {
      throw new Error(
        "Persistent components must have the @Persistent() tag aside for the @Field() tags required for each field."
      );
    }
    const fieldList = Object.keys(meta.fields);
    const mappedFields = fieldList.map(i => `${i}=VALUES(${i})`).join(",");
    const values = [entity.id];
    for (let name of fieldList) {
      let field = meta.fields[name];
      values.push(
        await field.type.serialize((component as any)[field.property])
      );
    }
    fieldList.unshift("entity_id");
    const blankFields = fieldList.map(i => "?").join(",");
    const names = fieldList.join(",");
    const header = `INSERT INTO ${tableName} (${names}) VALUES (${blankFields})`;
    const onDuplicate = `ON DUPLICATE KEY UPDATE ${mappedFields}`;
    const query = `${header} ${onDuplicate}`;
    await connection.query(query, values);
  }

  async delete(entity: Entity, options: Partial<QueryOptions> = {}) {
    throw new Error("Not Implemented");
  }

  private async _generateEntityId(connection: DatabaseConnection) {
    let entity = null;
    let id = uuid();
    do {
      entity = null;
      let result = await connection.query(
        `SELECT * from ${this._entitiesTable} WHERE id=?`,
        [id]
      );
      if (Array.isArray(result) && result.length > 0) {
        entity = result[0];
        id = uuid();
      }
    } while (entity !== null);
    return id;
  }

  async create(options: Partial<QueryOptions> = {}): Promise<Entity> {
    const connection = options.connection || (await this.connect());
    connection.logQueriesToConsole = !!options.logQueriesToConsole;
    try {
      const id = await this._generateEntityId(connection);
      await connection.query(
        `INSERT INTO ${this._entitiesTable} (id, component_list) VALUES (?, ?)`,
        [id, "[]"]
      );
      if (!options.connection) {
        await connection.release();
      }
      const entity = new DatabaseEntity(this);
      entity.id = id;
      return entity;
    } catch (error) {
      if (!options.connection) {
        await connection.release();
      }
      throw error;
    }
  }

  addComponentType<T extends Component>(component: ComponentClass<T>) {
    const meta = getPersistentMetadata(component.prototype);
    if (!meta || !meta.tableName) {
      throw new Error("Database models must have a @Persistent decorator");
    }
    const tag = component.tag || component.name;
    if (this._modelsByTable[meta.tableName]) {
      throw new Error(
        `Database already has the model "${tag}" already registered.`
      );
    }
    this._models.push(meta);
    this._modelsByTable[meta.tableName] = meta;
    this._componentClassesByTable[meta.tableName] = component;
    return this;
  }

  addComponentTypes(...components: ComponentClass<Component>[]) {
    for (let c of components) {
      this.addComponentType(c);
    }
    return this;
  }

  async findByComponents(options = Database.FIND_ALL) {
    const { include, exclude, logQueriesToConsole } = options;
    const conditions = this._makeConditions("IN", include).concat(
      this._makeConditions("NOT IN", exclude)
    );
    const connection = options.connection || (await this.connect());
    connection.logQueriesToConsole = !!logQueriesToConsole;
    try {
      const result = await this._findWithAllComponents(conditions, connection);
      if (!options.connection) {
        connection.close();
      }
      return result;
    } catch (error) {
      if (!options.connection) {
        connection.close();
      }
      throw error;
    }
  }

  private async _findWithAllComponents(
    conditions: string[],
    connection: DatabaseConnection
  ): Promise<Entity[]> {
    const results = await this._getEntitiesFromConditions(
      conditions,
      connection
    );
    const entities = [];
    const entitiesById: { [s: string]: Entity } = {};
    const tables: string[] = [];
    for (let result of results) {
      let entity = new DatabaseEntity(this);
      entity.id = result.id;
      entitiesById[result.id] = entity;
      let componentSet: string[] = JSON.parse(result.component_list);
      for (let c of componentSet) {
        if (tables.indexOf(c) === -1) {
          tables.push(c);
        }
      }
      entities.push(entity);
    }
    await this._populateEntities(entities, entitiesById, tables, connection);
    return entities;
  }

  private async _getEntitiesFromConditions(
    conditions: string[],
    connection: DatabaseConnection
  ) {
    const table = this._entitiesTable;
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT id, component_list FROM ${table} ${where}`;
    return (await connection.query(query)) as mysql.RowDataPacket[];
  }

  private async _populateEntities(
    entities: Entity[],
    entitiesById: { [s: string]: Entity },
    tables: string[],
    connection: DatabaseConnection
  ) {
    if (entities.length < 1) return;
    const ids = entities.map(i => i.id);
    const map = ids.map(i => "?").join(",");
    const condition =
      ids.length > 1 ? `entity_id IN (${map})` : "entity_id = ?";
    for (let table of tables) {
      await this._populateFromTable(
        table,
        ids,
        condition,
        entitiesById,
        connection
      );
    }
  }

  private async _populateFromTable(
    table: string,
    ids: any[],
    condition: string,
    entitiesById: { [s: string]: Entity },
    connection: DatabaseConnection
  ) {
    const meta = this._modelsByTable[table];
    const component = this._componentClassesByTable[table];
    if (!meta || !component) {
      throw new Error(
        `There is no information for components in table ${table}.`
      );
    }
    const fields = ["entity_id"].concat(Object.keys(meta.fields));
    const query = `SELECT ${fields.join(",")} FROM ${table} WHERE ${condition}`;
    const rows = (await connection.query(query, ids)) as mysql.RowDataPacket[];
    for (let row of rows) {
      let entity = entitiesById[row.entity_id];
      if (entity) {
        await this._regenerateComponent(entity, meta, component, row, fields);
      }
    }
  }

  private async _regenerateComponent(
    entity: Entity,
    meta: PersistenceOptions,
    componentClass: ComponentClass<Component>,
    row: mysql.RowDataPacket,
    fields: string[]
  ) {
    const component: any = entity.putComponent(componentClass);
    for (let field of fields) {
      const data = meta.fields[field];
      if (data) {
        component[data.property] = await data.type.deserialize(row[field]);
      }
    }
  }

  private _makeConditions(gOp: string, list: ComponentClass<Component>[]) {
    if (list.length < 1) return [];
    return list.map(i => {
      const meta = getPersistentMetadata(i.prototype);
      if (!meta) {
        throw new Error(
          `Metadata for component ${i.tag ||
            i.name} was not found.\nDoes that component have a @Persistent() annotation added?`
        );
      }
      const table = meta.tableName;
      if (!table) {
        throw new Error(
          `Table name for component ${i.tag ||
            i.name} was not found.\nDoes that component have a @Persistent() annotation added?`
        );
      }
      return `id ${gOp} (SELECT ${table}.entity_id FROM ${table})`;
    });
  }
}

export {
  Database,
  DatabaseOptions,
  QueryOptions,
  DatabaseConnection,
  FindOptions
};
