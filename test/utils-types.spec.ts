import { describe, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { ApiResponse, OngoingError } from "../src/ongoing-wms-api/utils";

describe("ApiResponse envelope", () => {
  it("success branch carries data and response, error is undefined", () => {
    expectTypeOf<ApiResponse<{ id: number }>>().toEqualTypeOf<
      | { data: { id: number }; error?: undefined; response: Response }
      | { data?: undefined; error: OngoingError; response: Response }
    >();
  });

  it("error payload matches observed Ongoing error shape", () => {
    expectTypeOf<OngoingError>().toEqualTypeOf<{ message: string }>();
  });

  it("accepts runtime success shape without error key", () => {
    expectTypeOf<{ data: { id: number }; response: Response }>().toExtend<
      ApiResponse<{ id: number }>
    >();
  });

  it("accepts runtime error shape without data key", () => {
    expectTypeOf<{ error: OngoingError; response: Response }>().toExtend<
      ApiResponse<{ id: number }>
    >();
  });
});
