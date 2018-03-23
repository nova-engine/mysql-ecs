import { Component, ComponentClass, Entity } from "@nova-engine/ecs";
import { FieldOptions } from "./Field";
import { DataTypes } from "../DataTypes";

import * as extend from "extend";
import * as pluralize from "pluralize";
import * as s from "underscore.string";

interface PersistenceOptions {
  tableName: string;
  fields: { [name: string]: FieldOptions };
}

const PERSISTENCE_METADATA_KEY = "@nova-engine/mysql-ecs/persistent";

function Persistent<T extends Component>(
  options: Partial<PersistenceOptions> = {}
) {
  return (target: ComponentClass<T>) => {
    const defaultOptions: PersistenceOptions = {
      tableName: pluralize(s.underscored(s.trim(target.tag || target.name))),
      fields: {
        id: {
          type: DataTypes.ID,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
        }
      }
    };
    const instanceOptions = extend(true, {}, defaultOptions, options);
    console.log("Persistent class added:", target.name);
    Reflect.defineMetadata(
      PERSISTENCE_METADATA_KEY,
      instanceOptions,
      target.prototype
    );
  };
}

export { Persistent, PersistenceOptions, PERSISTENCE_METADATA_KEY };
