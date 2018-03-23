import { Family, Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { Database } from "./Database";
interface DatabaseFamilyOptions {
    database: Database;
    include?: ComponentClass<Component>[];
    exclude?: ComponentClass<Component>[];
}
declare class DatabaseFamily implements Family {
    private readonly _database;
    private readonly _include;
    private readonly _exclude;
    private _cache;
    constructor(options: DatabaseFamilyOptions);
    readonly entities: Entity[];
    findEntities(): Promise<void>;
    includesEntity: (entity: Entity) => boolean;
}
export { DatabaseFamily, DatabaseFamilyOptions };
