import * as mysql from "mysql2";

import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { PersistenceOptions } from "./decorators/Persistent";
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

  private readonly pool: mysql.Pool;

  constructor(options: DatabaseOptions) {
    this._models = [];
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

  async sync() {
    throw new Error("Not Implemented");
  }

  async save(entity: Entity, options: Partial<QueryOptions> = {}) {
    if (entity.isNew()) {
      const newEntity = await this.create(options);
      entity.id = newEntity.id;
    }
    await this.update(entity, options);
  }

  async update(entity: Entity, options: Partial<QueryOptions> = {}) {
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
      if (!inTransaction) {
        await connection.commit();
      }
    } catch (e) {
      if (!options.connection) {
        await connection.release();
      }
      throw e;
    }
  }

  async _updateInDatabase(
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

  async create(options: Partial<QueryOptions> = {}): Promise<Entity> {
    throw new Error("Not Implemented");
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

  addComponentTypes<T extends Component>(...components: ComponentClass<T>[]) {
    for (let c of components) {
      this.addComponentType(c);
    }
    return this;
  }
}

export { Database, DatabaseOptions, QueryOptions, DatabaseConnection };
