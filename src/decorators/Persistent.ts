import { Component, ComponentClass, Entity } from "@nova-engine/ecs";
import { FieldOptions } from "./Field";
import { DataTypes } from "../DataTypes";

import * as pluralize from "pluralize";
import * as s from "underscore.string";

import {
  ensurePersistentMetadata,
  updatePersistentMetadata
} from "../services/meta";

interface PersistenceOptions {
  tableName: string | null;
  fields: { [name: string]: FieldOptions };
}

interface PersistenceDecoratorOptions {
  tableName: string;
}

function Persistent<T extends Component>(
  options: Partial<PersistenceDecoratorOptions> = {}
) {
  return (target: ComponentClass<T>) => {
    const defaultOptions = {
      tableName: pluralize(s.underscored(s.trim(target.tag || target.name)))
    };
    updatePersistentMetadata(target.prototype, defaultOptions);
    updatePersistentMetadata(target.prototype, options);
  };
}

export { Persistent, PersistenceOptions, PersistenceDecoratorOptions };
