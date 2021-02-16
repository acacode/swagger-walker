import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";

import type { SwaggerWalker } from "../SwaggerWalker";

interface ISchemaServer
  extends Required<Omit<OpenAPIV3.ServerObject, "variables">> {
  variables: (OpenAPIV3.ServerVariableObject & { variableName: string })[];
}

export class SchemaServer implements ISchemaServer {
  constructor(private value: OpenAPIV3.ServerObject) {}
  get url(): string {
    return this.value.url || "";
  }
  get description(): string {
    return this.value.url || "";
  }
  get variables(): ISchemaServer["variables"] {
    return _.map(this.value.variables, (variable, variableName) => ({
      ...variable,
      variableName,
    }));
  }
}

export class SchemaServers {
  public values: SchemaServer[] = [];
  constructor(walker: SwaggerWalker) {
    this.values = _.compact(
      _.map(walker.schema.servers, (server) =>
        server ? new SchemaServer(server) : null
      )
    );
  }
}
