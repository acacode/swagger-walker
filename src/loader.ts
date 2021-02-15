import axios from "axios";
import yaml from "js-yaml";
import _ from "lodash";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import converter from "swagger2openapi";

import fs from "fs";
import https from "https";

import { ParseSwaggerOptions } from ".";

const parseSwaggerFile = (
  file: string | Record<string, unknown>
): Record<string, unknown> | null => {
  if (typeof file !== "string") return file;

  try {
    return JSON.parse(file);
  } catch (e) {
    const jsonFromYaml = yaml.load(file);
    if (typeof jsonFromYaml === "object") {
      return jsonFromYaml as Record<string, unknown>;
    }

    return null;
  }
};

const getSwaggerFile = (
  pathToSwagger?: string,
  urlToSwagger?: string,
  disableStrictSSL?: boolean
): Promise<string> =>
  new Promise((resolve) => {
    if (pathToSwagger && fs.existsSync(pathToSwagger)) {
      // eslint-disable-next-line no-console
      console.log(`✨ try to get swagger by path "${pathToSwagger}"`);
      const buffer = fs.readFileSync(pathToSwagger, { encoding: "utf-8" });
      resolve(buffer.toString());
    } else {
      // eslint-disable-next-line no-console
      console.log(`✨ try to get swagger by url "${urlToSwagger}"`);
      let agent = undefined;
      if (disableStrictSSL) {
        agent = new https.Agent({
          rejectUnauthorized: false,
        });
      }
      if (urlToSwagger) {
        axios
          .get<string>(urlToSwagger, { httpsAgent: agent })
          .then((res) => resolve(res.data));
      }
    }
  });

export type ConversionResult =
  | {
      usageSchema: OpenAPIV3.Document;
      originalSchema: OpenAPIV3.Document;
      convertedFromSwagger2: false;
    }
  | {
      usageSchema: OpenAPIV3.Document;
      originalSchema: OpenAPIV2.Document;
      convertedFromSwagger2: true;
    };

const convertSwaggerObject = (
  swaggerSchema: Record<string, unknown>
): Promise<ConversionResult> => {
  return new Promise((resolve) => {
    if ("openapi" in swaggerSchema && !!swaggerSchema.openapi) {
      return resolve({
        usageSchema: (swaggerSchema as unknown) as OpenAPIV3.Document,
        originalSchema: (swaggerSchema as unknown) as OpenAPIV3.Document,
        convertedFromSwagger2: false,
      });
    }

    converter.convertObj(
      swaggerSchema,
      {
        warnOnly: true,
        refSiblings: "preserve",
        rbname: "requestBodyName",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (err: any, options: any) {
        const openapiDoc = _.get<OpenAPIV3.Document>(
          err,
          "options.openapi",
          _.get(options, "openapi")
        );

        if (!openapiDoc && err) {
          throw new Error(err);
        }
        resolve({
          usageSchema: openapiDoc,
          originalSchema: (swaggerSchema as unknown) as OpenAPIV2.Document,
          convertedFromSwagger2: true,
        });
      }
    );
  });
};

const fixSwaggerScheme = (
  usage: OpenAPIV3.Document,
  original: OpenAPIV3.Document | OpenAPIV2.Document
) => {
  const usagePaths = _.get(usage, "paths");
  const originalPaths = _.get(original, "paths");

  // walk by routes
  _.each(usagePaths, (usagePathObject, route) => {
    const originalPathObject = _.get(originalPaths, route);

    // walk by methods
    _.each(usagePathObject, (usageRouteInfo, methodName) => {
      const originalRouteInfo = _.get(originalPathObject, methodName);
      const usageRouteParams = _.get(usageRouteInfo, "parameters", []);
      const originalRouteParams = _.get(originalRouteInfo, "parameters", []);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usageRouteInfo.consumes = _.uniq(
        _.compact([
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...(usageRouteInfo.consumes || []),
          ...(originalRouteInfo.consumes || []),
        ])
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usageRouteInfo.produces = _.uniq(
        _.compact([
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...(usageRouteInfo.produces || []),
          ...(originalRouteInfo.produces || []),
        ])
      );

      _.each(originalRouteParams, (originalRouteParam) => {
        const existUsageParam = _.find(
          usageRouteParams,
          (param) =>
            originalRouteParam.in === param.in &&
            originalRouteParam.name === param.name
        );
        if (!existUsageParam) {
          usageRouteParams.push(originalRouteParam);
        }
      });
    });
  });
};

export const getSwaggerObject = async ({
  path,
  url,
  spec,
  disableStrictSSL,
}: ParseSwaggerOptions) => {
  let converted: ConversionResult | null = null;

  try {
    if (spec) {
      converted = await convertSwaggerObject(spec);
    } else {
      const file = await getSwaggerFile(path, url, disableStrictSSL);
      const swaggerJsObject = parseSwaggerFile(file);

      if (!swaggerJsObject) {
        throw "conversion result is null";
      }

      converted = await convertSwaggerObject(swaggerJsObject);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("🥵 Failed to load swagger schema", e);
    return null;
  }

  if (converted) {
    fixSwaggerScheme(converted.usageSchema, converted.originalSchema);
  }

  return converted;
};
