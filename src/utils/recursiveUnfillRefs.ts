/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

import { StrictOpenAPIV3Doc } from "../interfaces/swagger";

import { findByRef } from "./findByRef";
import { isReferenceObject } from "./isReferenceObject";

export const recursiveUnfillRefs = async (
  docPart: unknown,
  fullDoc: StrictOpenAPIV3Doc
): Promise<unknown> => {
  if (_.isArray(docPart)) {
    return await Promise.all(
      _.map(docPart, (part) => recursiveUnfillRefs(part, fullDoc))
    );
  }

  if (_.isObject(docPart)) {
    const keys = _.keys(docPart);
    const fixedDocPart: Record<string, unknown> = {};

    for await (const key of keys) {
      const value = docPart[key];

      if (_.isArray(value)) {
        fixedDocPart[key] = await recursiveUnfillRefs(value, fullDoc);
      } else if (_.isObject(value)) {
        if (isReferenceObject(value)) {
          const found = await findByRef(fullDoc, value);
          fixedDocPart[key] = found;
        } else {
          fixedDocPart[key] = await recursiveUnfillRefs(value, fullDoc);
        }
      } else {
        fixedDocPart[key] = value;
      }
    }

    return fixedDocPart;
  }

  return docPart;
};
