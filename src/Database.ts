import * as mysql from "mysql2";
import * as uuid from "uuid/v4";

import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { PersistenceOptions } from "./decorators/Persistent";
import { FieldOptions } from "./decorators/Field";

import { getPersistentMetadata } from "./services/meta";

interface QueryOptions {
  connection: DatabaseConnection;
  inTransaction: boolean;
}

interface DatabaseOptions extends mysql.PoolOptions {}

class DatabaseConnection {
  private readonly _connection: mysql.PoolConnection;
  private _inTransaction: boolean;
  private _closed: boolean;

  constructor(connection: mysql.PoolConnection) {
    this._connection = connection;
    this._inTransaction = false;
    this._closed = false;
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
  private readonly _models: PersistenceOptions[];
  private readonly _entitiesTable: string;
  private readonly pool: mysql.Pool;

  constructor(options: DatabaseOptions) {
    this._models = [];
    this._entitiesTable = "entities";
    const { ...poolOptions } = options;
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
    const inTransaction = connection.inTransaction;
    if (!inTransaction) {
      await connection.beginTransaction();
    }
    try {
      await this._createEntitiesTable(connection);
      await this._createModelTables(connection);
      if (!inTransaction) {
        await connection.commit();
      }
      if (!options.connection) {
        await connection.release();
      }
    } catch (error) {
      if (!options.connection) {
        await connection.release();
      }
      throw error;
    }
  }

  private async _createEntitiesTable(connection: DatabaseConnection) {
    await connection.query(`CREATE TABLE IF NOT EXISTS ${this._entitiesTable} ( 
      \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
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
    const inTransaction = connection.inTransaction;
    if (!inTransaction) {
      await connection.beginTransaction();
    }
    try {
      const components = entity.listComponentsWithTypes();
      for (let { type, component } of components) {
        let meta = getPersistentMetadata(type.prototype);
        if (meta) {
          await this._updateInDatabase(connection, meta, component);
        }
      }
      await connection.query(
        `UPDATE ${this._entitiesTable} SET updated_at=NOW() WHERE id=?`,
        [entity.id]
      );
      if (!inTransaction) {
        await connection.commit();
      }
    } catch (e) {
      if (!options.connection) {
        await connection.release();
      }
      throw e;
    }
    return entity;
  }

  private async _updateInDatabase(
    connection: DatabaseConnection,
    meta: PersistenceOptions,
    component: Component
  ) {
    if (!meta.tableName) {
      throw new Error(
        "Persistent components must have the @Persistent() tag aside for the @Field() tags required for each field."
      );
    }
    throw new Error("Not implemented");
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
    try {
      const id = await this._generateEntityId(connection);
      await connection.query(
        `INSERT INTO ${this._entitiesTable} (id) VALUES (?)`,
        [id]
      );
      if (!options.connection) {
        await connection.release();
      }
      const entity = new Entity();
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
    if (this._models.indexOf(meta) !== -1) {
      throw new Error(
        `Database already has the model "${tag}" already registered.`
      );
    }
    this._models.push(meta);
    return this;
  }

  addComponentTypes(...components: ComponentClass<Component>[]) {
    for (let c of components) {
      this.addComponentType(c);
    }
    return this;
  }
}

export { Database, DatabaseOptions, QueryOptions, DatabaseConnection };
