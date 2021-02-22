/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

import { StrictOpenAPIV3Doc } from "../interfaces/swagger";

import { findByRef } from "./findByRef";
import { isReferenceObject } from "./isReferenceObject";

const pathToRef = (path: string[]): string => {
  return `#/${_.join(path, "/")}`;
};

const removeRefPart = (ref: string, refToRemove: string): string[] => {
  return _.compact(_.replace(ref, refToRemove, "").split("/"));
};

class ReferenceData {
  constructor(private path: string[], private ref: string) {}

  async complete(partResultedDoc: unknown): Promise<unknown> {
    const foo = await findByRef(
      partResultedDoc as StrictOpenAPIV3Doc,
      this.ref
    );
    const ref = this.ref;
    const pathFromRef = pathToRef(this.path);
    const isRecursive = _.includes(pathFromRef, ref);

    if (isRecursive && _.isObject(foo)) {
      const recursivePath = removeRefPart(pathFromRef, ref);
      _.set(foo, recursivePath, foo);
    }

    // TODO:
    return foo;
  }
}

export const unfillRefs = async (
  docPart: unknown,
  fullDoc: StrictOpenAPIV3Doc = docPart as StrictOpenAPIV3Doc,
  map = new Map<string, unknown>(),
  deep: string[] = []
): Promise<unknown> => {
  if (_.isArray(docPart)) {
    return _.compact(
      await Promise.all(
        _.map(docPart, (part, index) =>
          unfillRefs(part, fullDoc, map, [...deep, `[${index}]`])
        )
      )
    );
  }

  if (_.isObject(docPart)) {
    if (isReferenceObject(docPart)) {
      return new ReferenceData(deep, docPart.$ref);
    }

    const keys = _.keys(docPart);
    const fixedDocPart: Record<string, unknown> = {};

    for await (const key of keys) {
      const value = docPart[key];

      if (_.isArray(value)) {
        fixedDocPart[key] = await unfillRefs(value, fullDoc, map, [
          ...deep,
          key,
        ]);
      } else if (_.isObject(value)) {
        if (isReferenceObject(value)) {
          fixedDocPart[key] = new ReferenceData([...deep, key], value.$ref);
        } else {
          fixedDocPart[key] = await unfillRefs(value, fullDoc, map, [
            ...deep,
            key,
          ]);
        }
      } else {
        fixedDocPart[key] = value;
      }
    }

    return fixedDocPart;
  }

  return docPart;
};

export const completeRefs = async (
  docPart: unknown,
  fullDoc: StrictOpenAPIV3Doc = docPart as StrictOpenAPIV3Doc
): Promise<void> => {
  if (_.isObject(docPart)) {
    const keys = _.keys(docPart);

    for await (const key of keys) {
      const value = docPart[key];

      if (value instanceof ReferenceData) {
        docPart[key] = await value.complete(fullDoc);
      } else {
        await completeRefs(docPart[key], fullDoc);
      }
    }
  }
};
