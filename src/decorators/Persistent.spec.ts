import "reflect-metadata";
import "mocha";
import { expect } from "chai";

import { Persistent, PersistenceOptions } from "./Persistent";
import { Field } from "./Field";
import { Component } from "@nova-engine/ecs";
import { DataTypes } from "../DataTypes";
import { getPersistentMetadata } from "../services/meta";

describe("@Persistent decorator", function() {
  it("Must define metadata", function() {
    @Persistent()
    class PersistentComponent implements Component {}
    const metadata = getPersistentMetadata(PersistentComponent.prototype);

    expect(metadata).to.not.be.equals(undefined);
    expect(metadata.tableName).to.be.a("string");
    expect(metadata.tableName).to.be.equal("persistent_components");
  });
  it("Can have a custom table name", function() {
    @Persistent({ tableName: "my_table" })
    class PersistentComponent implements Component {}
    const metadata: PersistenceOptions = getPersistentMetadata(
      PersistentComponent.prototype
    );
    expect(metadata).to.not.be.equals(undefined);
    expect(metadata.tableName).to.be.a("string");
    expect(metadata.tableName).to.be.equal("my_table");
  });
});
