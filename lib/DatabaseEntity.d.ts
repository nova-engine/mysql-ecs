import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { Database } from "./Database";
declare class DatabaseEntity extends Entity {
    private readonly _db;
    constructor(db: Database);
    putComponent<T extends Component>(componentClass: ComponentClass<T>): T;
    removeComponent<T extends Component>(componentClass: ComponentClass<T>): void;
}
export { DatabaseEntity };
