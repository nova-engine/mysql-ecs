import { Engine, Entity } from "@nova-engine/ecs";
import { DatabaseOptions, QueryOptions } from "./Database";
import { DatabaseEntity } from "./DatabaseEntity";
declare class DatabaseEngine extends Engine {
    static create(options: DatabaseOptions): Promise<DatabaseEngine>;
    private readonly _db;
    private _queue;
    constructor(options: DatabaseOptions);
    processQueue(options?: Partial<QueryOptions>): Promise<void>;
    private _processAction(action, options);
    load(): Promise<void>;
    save(): Promise<void>;
    addEntity(entity: Entity): this;
    createEntity(options?: Partial<QueryOptions>): DatabaseEntity;
    removeEntity(entity: Entity): void;
    onEntityChange: (entity: Entity) => void;
}
export { DatabaseEngine };
