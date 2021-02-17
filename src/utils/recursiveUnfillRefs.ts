/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";

import { FixedOpenAPIV3Doc } from "../interfaces/swagger";

import { findByRef } from "./findByRef";
import { isReferenceObject } from "./isReferenceObject";

export const recursiveUnfillRefs = (doc: FixedOpenAPIV3Doc) => {
  const fff = (docPart: any): any => {
    if (!_.isObject(docPart) && !_.isArray(docPart)) return docPart;

    return _.reduce<any, any>(
      docPart,
      (fixedDocPart, value, name) => {
        if (_.isArray(value)) {
          fixedDocPart[name] = _.map(value, fff);
        } else if (_.isObject(value)) {
          if (isReferenceObject(value)) {
            const found = findByRef(doc, value);
            fixedDocPart[name] = found;
          } else {
            fixedDocPart[name] = fff(value);
          }
        } else {
          fixedDocPart[name] = value;
        }

        return fixedDocPart;
      },
      docPart
    );
  };

  return fff(doc);
};
