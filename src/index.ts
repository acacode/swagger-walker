import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { OpenAPI } from "./interfaces/swagger";
import { SwaggerWalker } from "./SwaggerWalker/SwaggerWalker";
import { fixSwaggerScheme } from "./utils/fixSwaggerScheme";
import { getSwaggerObject } from "./utils/loader";
import { completeRefs, unfillRefs } from "./utils/unfillRefs";

export interface ParseSwaggerOptions {
  path?: string;
  url?: string;
  spec?: Record<string, unknown>;
  disableStrictSSL?: boolean;
}

const getSwaggerDocument = async (
  options: ParseSwaggerOptions
): Promise<{
  document: OpenAPI.Document;
  original: OpenAPIV3.Document | OpenAPIV2.Document;
  convertedFromSwagger2: boolean;
} | null> => {
  const conversion = await getSwaggerObject(options);

  if (!conversion) return null;

  fixSwaggerScheme(conversion.usageSchema, conversion.originalSchema);

  const document = await unfillRefs(conversion.usageSchema);

  await completeRefs(document);

  return {
    document: document as OpenAPI.Document,
    original: conversion.originalSchema,
    convertedFromSwagger2: conversion.convertedFromSwagger2,
  };
};

export const createSwaggerWalker = async (
  options: ParseSwaggerOptions
): Promise<SwaggerWalker | null> => {
  const document = await getSwaggerDocument(options);

  if (!document) return null;

  return new SwaggerWalker(
    document.document,
    document.original,
    document.convertedFromSwagger2
  );
};
