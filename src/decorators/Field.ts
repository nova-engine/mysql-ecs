import { Component, ComponentClass, Entity } from "@nova-engine/ecs";
import { PERSISTENCE_METADATA_KEY, PersistenceOptions } from "./Persistent";
import { DataType } from "..";

interface FieldOptions {
  type?: DataType;
  primaryKey?: boolean;
  allowNull?: boolean;
  autoIncrement?: boolean;
}

function Field(options: Partial<FieldOptions> = {}) {
  return (target: any, property: string, descriptor?: PropertyDescriptor) => {};
}

export { Field, FieldOptions };
