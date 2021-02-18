import { OpenAPIV3 } from "openapi-types";

import schema from "./github.json";
import { OpenAPI } from "./interfaces/swagger";
import { SwaggerWalker } from "./SwaggerWalker";
import { fixSwaggerScheme } from "./utils/fixSwaggerScheme";
import { getSwaggerObject } from "./utils/loader";
import { recursiveUnfillRefs } from "./utils/recursiveUnfillRefs";

export interface ParseSwaggerOptions {
  path?: string;
  url?: string;
  spec?: Record<string, unknown>;
  disableStrictSSL?: boolean;
}

const getSwaggerDocument = async (
  options: ParseSwaggerOptions
): Promise<OpenAPI.Document | null> => {
  const conversion = await getSwaggerObject(options);

  if (!conversion) return null;

  fixSwaggerScheme(conversion.usageSchema, conversion.originalSchema);

  const fixedDoc: OpenAPI.RawStrictDocument = {
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

  const document = (await recursiveUnfillRefs(
    fixedDoc,
    fixedDoc
  )) as OpenAPI.Document;

  return document;
};

export const createSwaggerWalker = async (
  options: ParseSwaggerOptions
): Promise<SwaggerWalker | null> => {
  const document = await getSwaggerDocument(options);

  if (!document) return null;

  return new SwaggerWalker(document);
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
