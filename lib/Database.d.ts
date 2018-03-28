import * as mysql from "mysql2";
import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
interface QueryOptions {
    connection: DatabaseConnection;
    inTransaction: boolean;
}
interface DatabaseOptions extends mysql.PoolOptions {
}
declare class DatabaseConnection {
    private readonly _connection;
    private _inTransaction;
    private _closed;
    constructor(connection: mysql.PoolConnection);
    query(query: string, params?: any[] | null): Promise<mysql.RowDataPacket | mysql.OkPacket | mysql.RowDataPacket[] | mysql.OkPacket[] | mysql.RowDataPacket[][]>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    release(): Promise<void>;
    readonly inTransaction: boolean;
}
declare class Database {
    private readonly _models;
    private readonly _entitiesTable;
    private readonly pool;
    constructor(options: DatabaseOptions);
    connect(): Promise<DatabaseConnection>;
    close(): Promise<void>;
    sync(options?: Partial<QueryOptions>): Promise<void>;
    private _createEntitiesTable(connection);
    private _createModelTables(connection);
    private _createComponentTable(connection, model);
    private _mapModelFields(fields);
    private _mapModelField(name, options);
    save(entity: Entity, options?: Partial<QueryOptions>): Promise<Entity>;
    update(entity: Entity, options?: Partial<QueryOptions>): Promise<Entity>;
    private _updateInDatabase(connection, meta, component);
    delete(entity: Entity, options?: Partial<QueryOptions>): Promise<void>;
    private _generateEntityId(connection);
    create(options?: Partial<QueryOptions>): Promise<Entity>;
    addComponentType<T extends Component>(component: ComponentClass<T>): this;
    addComponentTypes(...components: ComponentClass<Component>[]): this;
}
export { Database, DatabaseOptions, QueryOptions, DatabaseConnection };
