import _ from "lodash";

import { FixedOpenAPIV3Doc } from "../interfaces/swagger";

import { isReferenceObject } from "./isReferenceObject";

const reconcileRef = (ref: string): string => {
  const replaces = [
    ["#/parameters/", "#/components/parameters/"],
    ["#/responses/", "#/components/responses/"],
    ["#/definitions/", "#/components/schemas/"],
  ] as const;

  return _.reduce(
    replaces,
    (result, replace) => _.replace(result, replace[0], replace[1]),
    ref
  );
};

export const findByRef = <T extends unknown>(
  schema: FixedOpenAPIV3Doc,
  rawRef?: unknown
): ((T & { $referencedTo: string }) | T) | null => {
  if (!rawRef) return null;

  let ref: string | null = null;

  // TODO

  if (typeof rawRef === "string") {
    ref = reconcileRef(rawRef);
  }
  if (isReferenceObject(rawRef)) {
    if (_.isObject(rawRef.$ref)) {
      console.info("it is not ref", rawRef);
      return rawRef as T;
    }

    ref = reconcileRef(rawRef.$ref);
  }

  if (!ref) {
    console.warn("findByRef > ref is empty", ref);
    return null;
  }

  const parts = ref.split("/").filter((part) => part && part !== "#");

  const foundDocument = _.get(schema, parts, null) as T | null;

  if (!foundDocument) {
    console.warn("findByRef > document by ref not found", ref);
    return null;
  }

  if (_.isObject(foundDocument) && !_.isArray(foundDocument)) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(foundDocument as any),
      $referencedTo: ref,
    };
  }

  return foundDocument;
};
