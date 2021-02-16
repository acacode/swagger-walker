import { OpenAPIV3 } from "openapi-types";

import type { SwaggerWalker } from "../SwaggerWalker";

export class SchemaInfo implements Required<OpenAPIV3.InfoObject> {
  constructor(private walker: SwaggerWalker) {}
  get version(): string {
    return this.walker.schema.info.version || "";
  }
  get title(): string {
    return this.walker.schema.info.title || "";
  }
  get description(): string {
    return this.walker.schema.info.description || "";
  }
  get termsOfService(): string {
    return this.walker.schema.info.termsOfService || "";
  }
  get contact(): OpenAPIV3.ContactObject {
    return {
      email: "",
      name: "",
      url: "",
      ...(this.walker.schema.info.contact || {}),
    };
  }
  get license(): OpenAPIV3.LicenseObject {
    return {
      name: "",
      url: "",
      ...(this.walker.schema.info.license || {}),
    };
  }
}
