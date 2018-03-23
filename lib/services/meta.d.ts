import { PersistenceOptions } from "../decorators/Persistent";
import { DataType } from "../DataTypes";
declare function ensurePersistentMetadata(target: any): PersistenceOptions;
declare function getPersistentMetadata(target: any): PersistenceOptions | undefined;
declare function updatePersistentMetadata(target: any, value: Partial<PersistenceOptions>): void;
declare function getDatabaseTypeFromMetadata(target: any, property: string): DataType;
export { ensurePersistentMetadata, getPersistentMetadata, updatePersistentMetadata, getDatabaseTypeFromMetadata };
