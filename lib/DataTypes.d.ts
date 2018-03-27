/// <reference types="node" />
interface DataType {
    db: string;
    serialize(value: any): Promise<any>;
    deserialize(value: any): Promise<any>;
}
interface Serializable {
    serialize(): Promise<string>;
}
interface SerializableClass<T extends Serializable> {
    new (): T;
    deserialize(value: string): T;
}
declare enum BlobSize {
    TINY = 0,
    REGULAR = 1,
    MEDIUM = 2,
    LONG = 3,
}
declare const DataTypes: {
    ID: {
        db: string;
        serialize(value: number): Promise<number>;
        deserialize(value: number): Promise<number>;
    };
    NUMBER: ((isFloat?: boolean) => {
        db: string;
        serialize(value: number): Promise<number>;
        deserialize(value: number): Promise<number>;
    }) & {
        db: string;
        serialize(value: number): Promise<number>;
        deserialize(value: number): Promise<number>;
    };
    STRING: ((length?: number) => {
        db: string;
        serialize(value: string): Promise<string>;
        deserialize(value: string): Promise<string>;
    }) & {
        db: string;
        serialize(value: string): Promise<string>;
        deserialize(value: string): Promise<string>;
    };
    BOOLEAN: {
        db: string;
        serialize(value: boolean): Promise<"Y" | "N">;
        deserialize(value: string): Promise<boolean>;
    };
    DATE: {
        db: string;
        serialize(value: Date): Promise<string>;
        deserialize(value: Date): Promise<Date>;
    };
    JSON: ((size?: BlobSize) => {
        db: string;
        serialize(value: any): Promise<string>;
        deserialize(value: string): Promise<any>;
    }) & {
        db: string;
        serialize(value: any): Promise<string>;
        deserialize(value: string): Promise<any>;
    };
    BLOB: ((size?: BlobSize) => {
        db: string;
        serialize(value: Buffer): Promise<Buffer>;
        deserialize(value: Buffer): Promise<Buffer>;
    }) & {
        db: string;
        serialize(value: Buffer): Promise<Buffer>;
        deserialize(value: Buffer): Promise<Buffer>;
    };
    SERIALIZABLE: <T extends Serializable>(serializable: SerializableClass<T>, size?: BlobSize) => {
        db: string;
        serialize(value: T): Promise<string>;
        deserialize(value: string): T;
    };
};
export { DataTypes, DataType, Serializable, SerializableClass, BlobSize };
