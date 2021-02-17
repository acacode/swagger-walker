import { OpenAPIV3 } from "openapi-types";

export type FixedOpenAPIV3Doc = Required<
  Omit<
    OpenAPIV3.Document,
    | "x-express-openapi-additional-middleware"
    | "x-express-openapi-validation-strict"
  >
>;
