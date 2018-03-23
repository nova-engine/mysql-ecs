/// <reference types="node" />
interface DataType {
    db: string;
    serialize(value: any): Promise<any>;
    deserialize(value: any): Promise<any>;
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
    JSON: {
        db: string;
        serialize(value: any): Promise<string>;
        deserialize(value: string): Promise<any>;
    };
    BLOB: (() => void) & {
        db: string;
        serialize(value: Buffer): Promise<Buffer>;
        deserialize(value: Buffer): Promise<Buffer>;
    };
};
export { DataTypes, DataType };
