import type { Resolver } from "../types";
import { bracketIndexToDot, createErrorProxy, errorPathObjectify } from "../utils";

export function yupResolver<T>(schema: import("yup").Schema<T>): Resolver<T> {
  const formatter = (e: Array<{ errors: Array<string>, path: string }>) => {
    return e.reduce((acc, err) => {
      acc[bracketIndexToDot(err.path) || "root"] = err.errors[0];
      return acc;
    }, {} as Record<string, string>);
  }

  return {
    validate: (state: T) => {
        try {
          schema.validateSync(state, { abortEarly: false });
          return {
            valid: true,
            error: null,
            data: state
          }
        } catch (e: any) {
          return {
            valid: false,
            error: createErrorProxy(errorPathObjectify(formatter(e.inner))),
            data: null
          }
        }
      }
    }
}
