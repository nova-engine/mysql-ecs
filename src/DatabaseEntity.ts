import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { Database } from "./Database";

class DatabaseEntity extends Entity {
  private readonly _db: Database;

  constructor(db: Database) {
    super();
    this._db = db;
  }

  putComponent<T extends Component>(componentClass: ComponentClass<T>) {
    // TODO: Notify change
    const result = super.putComponent(componentClass);
    return result;
  }

  removeComponent<T extends Component>(componentClass: ComponentClass<T>) {
    // TODO: Notify change
    super.removeComponent(componentClass);
  }
}

export { DatabaseEntity };
