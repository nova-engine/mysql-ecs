import "reflect-metadata";
import "mocha";
import { expect } from "chai";

import { Persistent } from "./Persistent";
import { Field } from "./Field";
import { getPersistentMetadata } from "../services/meta";
import { DataTypes } from "../DataTypes";

describe("@Field decorator", function() {
  it("Data types are properly guessed.", () => {
    class MyComponent {
      @Field() string: string;
      @Field() number: number;
      @Field() boolean: boolean;
      // MOCHA BUG, SEE: https://stackoverflow.com/questions/42771431/typescript-reflect-getmetadata-designtype-returns-object-instead-of-date-withou
      @Field(DataTypes.DATE) date: Date;
      // MOCHA BUG, SEE: https://stackoverflow.com/questions/42771431/typescript-reflect-getmetadata-designtype-returns-object-instead-of-date-withou
      @Field(DataTypes.BLOB) buffer: Buffer;
      @Field() json: { x: number; y: number };
    }
    const meta = getPersistentMetadata(MyComponent.prototype);
    expect(meta).to.not.be.undefined;
    expect(meta.fields).to.not.be.undefined;
    expect(meta.fields.string).to.not.be.undefined;
    expect(meta.fields.string.type).be.equals(DataTypes.STRING);
    expect(meta.fields.number).to.not.be.undefined;
    expect(meta.fields.number.type).be.equals(DataTypes.NUMBER);
    expect(meta.fields.boolean).to.not.be.undefined;
    expect(meta.fields.boolean.type).be.equals(DataTypes.BOOLEAN);
    expect(meta.fields.json).to.not.be.undefined;
    expect(meta.fields.json.type).be.equals(DataTypes.JSON);
    expect(meta.fields.buffer).to.not.be.undefined;
    expect(meta.fields.buffer.type).be.equals(DataTypes.BLOB);
    expect(meta.fields.date).to.not.be.undefined;
    expect(meta.fields.date.type).be.equals(DataTypes.DATE);
  });
  it("Can specify the type", function() {
    class MyComponent {
      @Field(DataTypes.STRING) boolean: boolean;
    }
    const meta = getPersistentMetadata(MyComponent.prototype);
    expect(meta.fields.boolean).to.not.be.undefined;
    expect(meta.fields.boolean.type).be.equals(DataTypes.STRING);
  });
  it("Can specify options", function() {
    class MyComponent {
      @Field({ allowNull: true, autoIncrement: true, primaryKey: true })
      test: number;
    }
    const meta = getPersistentMetadata(MyComponent.prototype);
    expect(meta.fields.test).to.not.be.undefined;
    expect(meta.fields.test.type).be.equals(DataTypes.NUMBER);
    expect(meta.fields.test.allowNull).be.equals(true);
    expect(meta.fields.test.autoIncrement).be.equals(true);
    expect(meta.fields.test.primaryKey).be.equals(true);
  });
  it("Property names are underscored", function() {
    class MyComponent {
      @Field() myField: number;
    }
    const meta = getPersistentMetadata(MyComponent.prototype);
    expect(meta.fields.my_field).to.not.be.undefined;
    expect(meta.fields.my_field.type).be.equals(DataTypes.NUMBER);
  });
  it("Can define a custom column name", function() {
    class MyComponent {
      @Field({ column: "custom" })
      myField: number;
    }
    const meta = getPersistentMetadata(MyComponent.prototype);
    expect(meta.fields.custom).to.not.be.undefined;
    expect(meta.fields.custom.type).be.equals(DataTypes.NUMBER);
  });
});
