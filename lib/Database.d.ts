import * as mysql from "mysql2";
import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
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
declare class DatabaseConnection {
    private readonly _connection;
    private _inTransaction;
    private _closed;
    logQueriesToConsole: boolean;
    constructor(connection: mysql.PoolConnection);
    query(query: string, params?: any[] | null): Promise<mysql.RowDataPacket | mysql.OkPacket | mysql.RowDataPacket[] | mysql.OkPacket[] | mysql.RowDataPacket[][]>;
    nestedTransaction(callback: () => Promise<any>): Promise<void>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    release(): Promise<void>;
    readonly inTransaction: boolean;
}
declare class Database {
    static readonly FIND_ALL: FindOptions;
    private readonly _models;
    private readonly _modelsByTable;
    private readonly _componentClassesByTable;
    private readonly _entitiesTable;
    private readonly pool;
    logQueriesToConsole: boolean;
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
    private _updateInDatabase(connection, meta, entity, component);
    delete(entity: Entity, options?: Partial<QueryOptions>): Promise<void>;
    private _generateEntityId(connection);
    create(options?: Partial<QueryOptions>): Promise<Entity>;
    addComponentType<T extends Component>(component: ComponentClass<T>): this;
    addComponentTypes(...components: ComponentClass<Component>[]): this;
    findByComponents(options?: FindOptions): Promise<Entity[]>;
    private _findWithAllComponents(conditions, connection);
    private _getEntitiesFromConditions(conditions, connection);
    private _populateEntities(entities, entitiesById, tables, connection);
    private _populateFromTable(table, ids, condition, entitiesById, connection);
    private _regenerateComponent(entity, meta, componentClass, row, fields);
    private _makeConditions(gOp, list);
}
export { Database, DatabaseOptions, QueryOptions, DatabaseConnection, FindOptions };
