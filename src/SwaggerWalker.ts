/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { ConversionResult } from "./loader";
import { SchemaComponents } from "./parts/SchemaComponents";
import { SchemaInfo } from "./parts/SchemaInfo";
import { SchemaPaths } from "./parts/SchemaPaths";
import { SchemaServers } from "./parts/SchemaServers";
import { RefFinder } from "./RefFinder";

export class SwaggerWalker extends RefFinder {
  public schema: OpenAPIV3.Document;
  public loadedSchema: OpenAPIV2.Document | OpenAPIV3.Document;

  public info: SchemaInfo;
  public servers: SchemaServers;
  public paths: SchemaPaths;
  public components: SchemaComponents;
  public security: any;
  public tags: any;
  public externalDocs: any;

  constructor(conversion: ConversionResult) {
    super(conversion.usageSchema);
    this.schema = conversion.usageSchema;
    this.loadedSchema = conversion.originalSchema;

    this.info = new SchemaInfo(this);
    this.servers = new SchemaServers(this);
    this.paths = new SchemaPaths(this);
    this.components = new SchemaComponents(this);
  }
}
