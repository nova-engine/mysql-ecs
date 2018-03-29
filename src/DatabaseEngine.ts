import { Engine, Entity } from "@nova-engine/ecs";

import { DatabaseOptions, Database, QueryOptions } from "./Database";
import { DatabaseEntity } from "./DatabaseEntity";

type RemoveAction = { type: "remove"; entity: Entity };
type SaveAction = { type: "save"; entity: Entity };

type Action = RemoveAction | SaveAction;

class DatabaseEngine extends Engine {
  static async create(options: DatabaseOptions) {
    const engine = new DatabaseEngine(options);
    await engine.load();
    return engine;
  }

  private readonly _db: Database;
  private _queue: Action[];

  constructor(options: DatabaseOptions) {
    super();
    this._db = new Database(options);
    this._queue = [];
  }

  async processQueue(options: Partial<QueryOptions> = {}) {
    const connection = options.connection || (await this._db.connect());
    const newOptions = {
      ...options,
      connection
    };
    await connection.nestedTransaction(async () => {
      const queue = this._queue;
      this._queue = [];
      while (queue.length > 0) {
        let action = queue.shift();
        if (action) {
          await this._processAction(action, newOptions);
        }
      }
    });
  }

  private async _processAction(action: Action, options: Partial<QueryOptions>) {
    switch (action.type) {
      case "save":
        return await this._db.save(action.entity, options);
      case "remove":
        return await this._db.delete(action.entity, options);
      default:
        break;
    }
  }

  async load() {
    const entities = await this._db.findByComponents();
    this.addEntities(...entities);
  }

  async save() {
    const entities = this.entities;
    for (let entity of entities) {
      await this._db.save(entity);
    }
  }

  addEntity(entity: Entity) {
    this._queue.push({ type: "save", entity });
    entity.addListener(this.onEntityChange);
    return super.addEntity(entity);
  }

  createEntity(options: Partial<QueryOptions> = {}) {
    const entity = new DatabaseEntity(this._db);
    this.addEntity(entity);
    return entity;
  }

  removeEntity(entity: Entity) {
    super.removeEntity(entity);
    entity.removeListener(this.onEntityChange);
    this._queue.push({ type: "remove", entity });
  }

  onEntityChange = (entity: Entity) => {
    this._queue.push({ type: "save", entity });
  };
}

export { DatabaseEngine };
