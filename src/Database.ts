import { Entity } from "@nova-engine/ecs";

interface QueryOptions {}

interface DatabaseOptions {}

class Database {
  constructor(options: DatabaseOptions) {}

  async save(entity: Entity, options: Partial<QueryOptions> = {}) {}

  async update(entity: Entity, options: Partial<QueryOptions> = {}) {}

  async delete(entity: Entity, options: Partial<QueryOptions> = {}) {}

  async create(options: Partial<QueryOptions> = {}): Promise<Entity> {
    return Promise.reject(new Error("Not Implemented"));
  }
}

export { Database, DatabaseOptions, QueryOptions };
