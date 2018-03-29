import { Family, Entity, ComponentClass, Component } from "@nova-engine/ecs";
import { Database } from "./Database";

interface DatabaseFamilyOptions {
  database: Database;
  include?: ComponentClass<Component>[];
  exclude?: ComponentClass<Component>[];
}

/**
 * An specialized family than works with the database as a medium.
 * It searches using a query and returning the selected entities.
 */
class DatabaseFamily implements Family {
  private readonly _database: Database;
  private readonly _include: ComponentClass<Component>[];
  private readonly _exclude: ComponentClass<Component>[];
  private _cache: Entity[];

  constructor(options: DatabaseFamilyOptions) {
    this._database = options.database;
    this._include = (options.include || []).slice(0);
    this._exclude = (options.exclude || []).slice(0);
    this._cache = [];
  }

  get entities() {
    return this._cache;
  }

  async findEntities() {
    this._cache = await this._database.findByComponents({
      include: this._include,
      exclude: this._exclude
    });
    return this._cache;
  }

  includesEntity = (entity: Entity) => {
    for (let include of this._include) {
      if (!entity.hasComponent(include)) return false;
    }
    for (let exclude of this._include) {
      if (entity.hasComponent(exclude)) return false;
    }
    return true;
  };
}

export { DatabaseFamily, DatabaseFamilyOptions };
