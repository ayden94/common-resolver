import type { Resolver } from "../types";
import { createErrorProxy, errorPathObjectify } from "../utils";

export function superstructResolver<T>(schema: import("superstruct").Struct<T, any>): Resolver<T> {
  const { validate } = require("superstruct");

  const formatter = (obj: Array<{message: string, path: Array<string | number>}>) => {
    return obj.reduce((acc, { message, path }) => {
      acc[path.join('.') || "root"] = message;
      return acc;
    }, {} as Record<string, string>);
  }

  return {
    validate: (state: T) => {
      const [error] = validate(state, schema);

      if (!error) {
        return {
          valid: true,
          error: null,
          data: state
        };
      } else {
        return {
          valid: false,
          error: createErrorProxy(errorPathObjectify(formatter(error.failures()))),
          data: null
        }
      }
    }
  }
}