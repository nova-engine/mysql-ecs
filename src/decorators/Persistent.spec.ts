import "reflect-metadata";
import "mocha";
import { expect } from "chai";

import {
  Persistent,
  PersistenceOptions,
  PERSISTENCE_METADATA_KEY
} from "./Persistent";
import { Field } from "./Field";
import { Component } from "@nova-engine/ecs";
import { DataTypes } from "../DataTypes";

describe("@Persistent decorator", function() {
  it("Must define metadata", function() {
    @Persistent()
    class PersistentComponent implements Component {}
    const metadata: PersistenceOptions = Reflect.getMetadata(
      PERSISTENCE_METADATA_KEY,
      PersistentComponent.prototype
    );
    expect(metadata).to.not.be.equals(undefined);
    expect(metadata.tableName).to.be.a("string");
    expect(metadata.tableName).to.be.equal("persistent_components");
  });
  it("Can have a custom table name", function() {
    @Persistent({ tableName: "my_table" })
    class PersistentComponent implements Component {}
    const metadata: PersistenceOptions = Reflect.getMetadata(
      PERSISTENCE_METADATA_KEY,
      PersistentComponent.prototype
    );
    expect(metadata).to.not.be.equals(undefined);
    expect(metadata.tableName).to.be.a("string");
    expect(metadata.tableName).to.be.equal("my_table");
  });
});
