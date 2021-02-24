import "lodash";

declare module "lodash" {
  interface LoDashStatic {
    /**
     * Checks if value is the language type of Object. (e.g. arrays, functions, objects, regexes, new Number(0),
     * and new String(''))
     *
     * @param value The value to check.
     * @return Returns true if value is an object, else false.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isObject(value?: any): value is Record<string, unknown>;
  }
}
