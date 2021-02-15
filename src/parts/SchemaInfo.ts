import { OpenAPIV3 } from "openapi-types";

export class SchemaInfo implements Required<OpenAPIV3.InfoObject> {
  constructor(private schema: OpenAPIV3.Document) {}
  get version(): string {
    return this.schema.info.version || "";
  }
  get title(): string {
    return this.schema.info.title || "";
  }
  get description(): string {
    return this.schema.info.description || "";
  }
  get termsOfService(): string {
    return this.schema.info.termsOfService || "";
  }
  get contact(): OpenAPIV3.ContactObject {
    return {
      email: "",
      name: "",
      url: "",
      ...(this.schema.info.contact || {}),
    };
  }
  get license(): OpenAPIV3.LicenseObject {
    return {
      name: "",
      url: "",
      ...(this.schema.info.license || {}),
    };
  }
}
