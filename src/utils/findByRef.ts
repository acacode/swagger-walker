import axios from "axios";
import _ from "lodash";

import fs from "fs";
import path from "path";

import { StrictOpenAPIV3Doc } from "../interfaces/swagger";

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

// const findRefBySchema = <T>(ref: string, schema: unknown): T | null => {
//   const parts = ref.split("/").filter((part) => part && part !== "#");

//   return _.get(schema, parts, null) as T | null;
// };

const getRefKind = (ref: string): "http" | "fs" | "schema" => {
  if (_.startsWith(ref, "#") || _.startsWith(ref, "/#")) return "schema";
  if (/https?:\/\//g.test(ref)) return "http";

  return "fs";
};

export const findByRef = async <T extends unknown>(
  schema: StrictOpenAPIV3Doc,
  rawRef?: unknown
): Promise<((T & { $referencedTo: string }) | T) | null> => {
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

  let foundDocument: T | null = null;

  try {
    switch (getRefKind(ref)) {
      case "schema": {
        const parts = ref.split("/").filter((part) => part && part !== "#");

        foundDocument = _.get(schema, parts, null) as T | null;
        break;
      }
      case "http": {
        // TODO:
        foundDocument = (await axios.get(ref)) || null;
        break;
      }
      case "fs": {
        // TODO:
        foundDocument = JSON.parse(
          fs.readFileSync(path.resolve(process.cwd(), ref), {
            encoding: "utf-8",
          })
        );
        break;
      }
      default: {
        break;
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("findByRef > try to get ref error", e);
    foundDocument = null;
  }

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
