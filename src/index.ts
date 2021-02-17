/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIV3 } from "openapi-types";

import schema from "./authentic.json";
import { FixedOpenAPIV3Doc } from "./interfaces/swagger";
import { getSwaggerObject } from "./utils/loader";
import { recursiveUnfillRefs } from "./utils/recursiveUnfillRefs";

export interface ParseSwaggerOptions {
  path?: string;
  url?: string;
  spec?: Record<string, unknown>;
  disableStrictSSL?: boolean;
}

export const createSwaggerWalker = async (
  options: ParseSwaggerOptions
): Promise<any> => {
  const conversion = await getSwaggerObject(options);

  if (!conversion) return null;

  const fixedDoc: FixedOpenAPIV3Doc = {
    components: {},
    externalDocs: { url: "" },
    servers: [],
    tags: [],
    security: [],
    ...conversion.usageSchema,
    paths: conversion.usageSchema.paths || {},
    openapi: conversion.usageSchema.openapi || "",
    info: {
      title: "",
      version: "",
      ...((conversion.usageSchema.info as Partial<OpenAPIV3.InfoObject>) || {}),
    },
  };

  return recursiveUnfillRefs(fixedDoc);
};

createSwaggerWalker({
  spec: schema,
}).then((swaggerWalker) => {
  if (swaggerWalker) {
    console.info(
      "FF"
      // swaggerWalker.components.find({
      //   kind: "schemas",
      //   name: "trees",
      // })
    );
  }
});
