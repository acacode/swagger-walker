import { getSwaggerObject } from "./loader";
import schema from "./schema.json";
import { SwaggerWalker } from "./SwaggerWalker";

export interface ParseSwaggerOptions {
  path?: string;
  url?: string;
  spec?: Record<string, unknown>;
  disableStrictSSL?: boolean;
}

export const parseSwagger = async (options: ParseSwaggerOptions) => {
  const conversionResult = await getSwaggerObject(options);

  if (!conversionResult) return null;

  return new SwaggerWalker(conversionResult);
};

parseSwagger({
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
