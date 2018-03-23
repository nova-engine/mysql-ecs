import { Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { PersistenceOptions } from ".";
import { getPersistentMetadata } from "./services/meta";

interface QueryOptions {}

interface DatabaseOptions {}

class Database {
  private readonly _models: PersistenceOptions[];

  constructor(options: DatabaseOptions) {
    this._models = [];
  }

  async sync() {
    throw new Error("Not Implemented");
  }

  async save(entity: Entity, options: Partial<QueryOptions> = {}) {
    throw new Error("Not Implemented");
  }

  async update(entity: Entity, options: Partial<QueryOptions> = {}) {
    throw new Error("Not Implemented");
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

export { Database, DatabaseOptions, QueryOptions };
