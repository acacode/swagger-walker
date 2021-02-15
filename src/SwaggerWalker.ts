import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { ConversionResult } from "./loader";
import { SchemaInfo } from "./parts/SchemaInfo";
import { RefFinder } from "./RefFinder";

export class SwaggerWalker extends RefFinder {
  private usageSchema: OpenAPIV3.Document;
  private originalSchema: OpenAPIV2.Document | OpenAPIV3.Document;

  public info: SchemaInfo;
  public servers: any;
  public paths: any;
  public components: any;
  public security: any;
  public tags: any;
  public externalDocs: any;

  constructor(conversion: ConversionResult) {
    super(conversion.usageSchema);
    this.usageSchema = conversion.usageSchema;
    this.originalSchema = conversion.originalSchema;

    this.info = new SchemaInfo(conversion.usageSchema);
  }
}
