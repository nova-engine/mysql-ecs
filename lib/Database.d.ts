import * as mysql from "mysql2";
import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { PersistenceOptions } from "./decorators/Persistent";
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
    private readonly pool;
    constructor(options: DatabaseOptions);
    connect(): Promise<DatabaseConnection>;
    sync(): Promise<void>;
    save(entity: Entity, options?: Partial<QueryOptions>): Promise<void>;
    update(entity: Entity, options?: Partial<QueryOptions>): Promise<void>;
    _updateInDatabase(connection: DatabaseConnection, meta: PersistenceOptions, component: Component): Promise<void>;
    delete(entity: Entity, options?: Partial<QueryOptions>): Promise<void>;
    create(options?: Partial<QueryOptions>): Promise<Entity>;
    addComponentType<T extends Component>(component: ComponentClass<T>): this;
    addComponentTypes<T extends Component>(...components: ComponentClass<T>[]): this;
}
export { Database, DatabaseOptions, QueryOptions, DatabaseConnection };
