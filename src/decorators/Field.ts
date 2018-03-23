import { Component, ComponentClass, Entity } from "@nova-engine/ecs";
import { DataType } from "../DataTypes";
import {
  ensurePersistentMetadata,
  getDatabaseTypeFromMetadata
} from "../services/meta";

import * as s from "underscore.string";
import * as extend from "extend";

interface FieldOptions {
  type: DataType;
  primaryKey: boolean;
  allowNull: boolean;
  autoIncrement: boolean;
}

interface FieldDecoratorOptions extends FieldOptions {
  column: string;
}

function isDataType(arg: any): arg is DataType {
  if (typeof arg.db != "string") return false;
  if (typeof arg.serialize != "function") return false;
  if (typeof arg.deserialize != "function") return false;
  return true;
}

function Field(arg: Partial<FieldDecoratorOptions> | DataType = {}) {
  let options: Partial<FieldDecoratorOptions>;
  if (isDataType(arg)) {
    options = { type: arg };
  } else {
    options = arg;
  }
  return (target: any, property: string, descriptor?: PropertyDescriptor) => {
    const meta = ensurePersistentMetadata(target);
    let { column, ...defaultOptions } = options;
    const type = getDatabaseTypeFromMetadata(target, property);
    const metaOptions = extend(
      { type, primaryKey: false, allowNull: false, autoIncrement: false },
      defaultOptions,
      options
    );
    if (!column) {
      column = s.underscored(property);
    }
    meta.fields[column] = metaOptions;
  };
}

export { Field, FieldOptions, FieldDecoratorOptions };
