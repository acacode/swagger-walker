/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

import { StrictOpenAPIV3Doc } from "../interfaces/swagger";

import { findByRef } from "./findByRef";
import { isReferenceObject } from "./isReferenceObject";

const pathToRef = (path: string[]): string => {
  return `#/${_.join(path, "/")}`;
};

const removeRefPart = (ref: string, refToRemove: string): string[] => {
  const splitted = _.split(refToRemove, "/");

  return _.compact(
    ref.split("/").filter((part) => part !== "#" && !splitted.includes(part))
  );
};

class ReferenceData {
  constructor(private path: string[], private ref: string) {}

  async complete(partResultedDoc: unknown): Promise<unknown> {
    const refData = await findByRef(
      partResultedDoc as StrictOpenAPIV3Doc,
      this.ref
    );
    const ref = this.ref;
    const pathFromRef = pathToRef(this.path);

    if (this.isRecursive(refData) && _.isObject(refData)) {
      const recursivePath = removeRefPart(pathFromRef, ref);
      _.set(refData, "$recursiveReference", true);

      if (!_.includes(recursivePath, "#") && _.has(refData, recursivePath)) {
        _.set(refData, recursivePath, refData);
      }
    }

    return refData;
  }

  private isRecursive(refData: unknown) {
    const ref = this.ref;
    const pathFromRef = pathToRef(this.path);

    if (_.includes(pathFromRef, ref)) {
      return true;
    }

    if (this.deepFindRecursive(refData)) {
      return true;
    }

    return false;
  }

  private deepFindRecursive = (refData: unknown): boolean => {
    if (refData instanceof ReferenceData) {
      return refData.ref === this.ref;
    }

    if (_.isObject(refData)) {
      return _.some(refData, (property) => this.deepFindRecursive(property));
    }

    return false;
  };

  public isEqualPath(path: string[]) {
    return _.join(this.path) === _.join(path);
  }

  public isEqualRef(ref: string) {
    return this.ref === ref;
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
