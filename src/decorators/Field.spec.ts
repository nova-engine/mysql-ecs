import "reflect-metadata";
import "mocha";
import { expect } from "chai";

import { Persistent } from "./Persistent";
import { Field } from "./Field";

describe("@Field decorator", function() {
  it("Only works on Components with the @Persistent decorator.", () => {
    expect(() => {
      @Persistent()
      class CustomField {
        @Field() id: string = "";
      }
    }).to.not.throw();
  });
});
