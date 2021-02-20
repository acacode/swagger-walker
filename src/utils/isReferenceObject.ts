import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";

export const isReferenceObject = (
  value: unknown
): value is OpenAPIV3.ReferenceObject => {
  return (
    !!value &&
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof _.get(value, "$ref") === "string"
  );
};
