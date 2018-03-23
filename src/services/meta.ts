import { PersistenceOptions } from "../decorators/Persistent";
import { DataTypes, DataType } from "../DataTypes";

import * as extend from "extend";

const KEY = "@nova-engine/mysql-ecs/persistent";

function ensurePersistentMetadata(target: any) {
  let meta: PersistenceOptions = Reflect.getMetadata(KEY, target);
  if (meta) {
    return meta;
  }
  meta = {
    tableName: null,
    fields: {
      id: {
        type: DataTypes.ID,
        property: "id",
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      }
    }
  };
  Reflect.defineMetadata(KEY, meta, target);
  return meta;
}

function getPersistentMetadata(target: any): PersistenceOptions | undefined {
  return Reflect.getMetadata(KEY, target);
}

function updatePersistentMetadata(
  target: any,
  value: Partial<PersistenceOptions>
) {
  const meta = ensurePersistentMetadata(target);
  extend(true, meta, value);
}

function getDatabaseTypeFromMetadata(target: any, property: string): DataType {
  const type = Reflect.getMetadata("design:type", target, property);
  switch (type) {
    case String:
      return DataTypes.STRING;
    case Number:
      return DataTypes.NUMBER;
    case Boolean:
      return DataTypes.BOOLEAN;
    case Date:
      return DataTypes.DATE;
    case Buffer:
      return DataTypes.BLOB;
    case Object:
      return DataTypes.JSON;
    case Function:
      throw new Error(
        `Function type property "${property}" cannot be persistent.`
      );
  }
  return DataTypes.JSON;
}

export {
  ensurePersistentMetadata,
  getPersistentMetadata,
  updatePersistentMetadata,
  getDatabaseTypeFromMetadata
};
