import _ from "lodash";

export const isNullable = (swaggerPart: unknown): boolean => {
  return !!(
    _.isObject(swaggerPart) &&
    (swaggerPart["nullable"] ||
      swaggerPart["x-isnullable"] ||
      swaggerPart["x-nullable"] ||
      swaggerPart["type"] === "null")
  );
};
