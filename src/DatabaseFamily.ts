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

  constructor(options: DatabaseFamilyOptions) {
    this._database = options.database;
    this._include = (options.include || []).slice(0);
    this._exclude = (options.exclude || []).slice(0);
  }

  get entities() {
    return [];
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