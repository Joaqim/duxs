import { expect } from "chai";

import * as lib from "../src";
import { ExampleClass } from "../src/example";

describe("Modules are exported", function () {
  it("ExampleClass is exported", function () {
    expect(lib.ExampleClass).to.equal(ExampleClass);
    expect(lib.ExampleClass).to.not.be.null;
    expect(lib.ExampleClass).to.not.be.undefined;
  });
});
