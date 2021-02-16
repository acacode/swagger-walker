import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";

import type { SwaggerWalker } from "../SwaggerWalker";

export class SchemaPath {
  constructor(private value: OpenAPIV3.PathItemObject, private route: string) {}
}

export class SchemaPaths {
  public values: SchemaPath[] = [];
  constructor(walker: SwaggerWalker) {
    this.values = _.compact(
      _.map(walker.schema.paths, (path, route) => {
        if (!path) return null;

        const refData = walker.findByRef<OpenAPIV3.PathItemObject>(path);

        return new SchemaPath({ ...(refData || {}), ...path }, route);
      })
    );
  }
}
