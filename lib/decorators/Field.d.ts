import { DataType } from "../DataTypes";
interface FieldOptions {
    type: DataType;
    property: string;
    allowNull: boolean;
}
interface FieldDecoratorOptions extends FieldOptions {
    column: string;
}
declare function Field(arg?: Partial<FieldDecoratorOptions> | DataType): (target: any, property: string, descriptor?: PropertyDescriptor | undefined) => void;
export { Field, FieldOptions, FieldDecoratorOptions };
