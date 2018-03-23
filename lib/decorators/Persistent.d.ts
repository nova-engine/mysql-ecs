import { Component, ComponentClass } from "@nova-engine/ecs";
import { FieldOptions } from "./Field";
interface PersistenceOptions {
    tableName: string | null;
    fields: {
        [name: string]: FieldOptions;
    };
}
interface PersistenceDecoratorOptions {
    tableName: string;
}
declare function Persistent<T extends Component>(options?: Partial<PersistenceDecoratorOptions>): (target: ComponentClass<T>) => void;
export { Persistent, PersistenceOptions, PersistenceDecoratorOptions };
