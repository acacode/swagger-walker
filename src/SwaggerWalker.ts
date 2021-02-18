import _ from "lodash";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { OpenAPI } from "./interfaces/swagger";
import { DeepRequired } from "./types/common";

type ComponentKinds = keyof ISwaggerWalker["components"];

interface ComponentExtras {
  $name: string;
  $kind: ComponentKinds;
}

interface PathExtras {
  $pattern: string;
}

interface OperationExtras extends PathExtras {
  consumes: OpenAPIV2.MimeTypes;
  produces: OpenAPIV2.MimeTypes;
}

interface SwaggerWalkerPath extends PathExtras {
  $referencedTo?: string;
  summary: string;
  description: string;
  get?: OpenAPI.OperationObject & OperationExtras;
  put?: OpenAPI.OperationObject & OperationExtras;
  post?: OpenAPI.OperationObject & OperationExtras;
  delete?: OpenAPI.OperationObject & OperationExtras;
  options?: OpenAPI.OperationObject & OperationExtras;
  head?: OpenAPI.OperationObject & OperationExtras;
  patch?: OpenAPI.OperationObject & OperationExtras;
  trace?: OpenAPI.OperationObject & OperationExtras;
  servers: OpenAPIV3.ServerObject[];
  parameters: OpenAPI.ParameterObject[];
}

export interface ISwaggerWalker {
  openapi: string;
  info: DeepRequired<OpenAPIV3.InfoObject>;
  servers: OpenAPIV3.ServerObject[];
  paths: SwaggerWalkerPath[];
  components: {
    schemas: (OpenAPI.SchemaObject & ComponentExtras)[];
    responses: (OpenAPI.ResponseObject & ComponentExtras)[];
    parameters: (OpenAPI.ParameterObject & ComponentExtras)[];
    examples: (OpenAPIV3.ExampleObject & ComponentExtras)[];
    requestBodies: (OpenAPI.RequestBodyObject & ComponentExtras)[];
    headers: (OpenAPI.HeaderObject & ComponentExtras)[];
    securitySchemes: (OpenAPIV3.SecuritySchemeObject & ComponentExtras)[];
    links: (OpenAPIV3.LinkObject & ComponentExtras)[];
    callbacks: (OpenAPI.CallbackObject & ComponentExtras)[];
  };
  security: OpenAPIV3.SecurityRequirementObject[];
  tags: DeepRequired<OpenAPIV3.TagObject>[];
  externalDocs: DeepRequired<OpenAPIV3.ExternalDocumentationObject>;
}

export class SwaggerWalker implements ISwaggerWalker {
  openapi: ISwaggerWalker["openapi"];
  info: ISwaggerWalker["info"];
  servers: ISwaggerWalker["servers"];
  paths: ISwaggerWalker["paths"];
  components: ISwaggerWalker["components"];
  security: ISwaggerWalker["security"];
  tags: ISwaggerWalker["tags"];
  externalDocs: ISwaggerWalker["externalDocs"];

  constructor(public document: OpenAPI.Document) {
    this.openapi = document.openapi;
    this.info = this.collectInfo(document.info);
    this.servers = this.collectServers(document.servers);
    this.paths = this.collectPaths(document.paths);
    this.components = this.collectComponents(document.components);
    this.security = this.collectSecurity(document.security);
    this.tags = this.collectTags(document.tags);
    this.externalDocs = this.collectExternalDocs(document.externalDocs);
  }

  private collectInfo(info: OpenAPI.Document["info"]): ISwaggerWalker["info"] {
    return _.merge<ISwaggerWalker["info"], OpenAPI.Document["info"]>(
      {
        contact: {
          email: "",
          name: "",
          url: "",
        },
        description: "",
        license: {
          name: "",
          url: "",
        },
        termsOfService: "",
        title: "",
        version: "",
      },
      info
    );
  }

  private collectServers(
    servers: OpenAPI.Document["servers"]
  ): ISwaggerWalker["servers"] {
    return _.compact(servers);
  }

  private createOperation(
    $pattern: string,
    operation?: OpenAPI.OperationObject
  ): undefined | (OpenAPI.OperationObject & OperationExtras) {
    if (!operation) return;

    return {
      ...operation,
      $pattern,
      consumes: _.get(operation, "consumes", []),
      produces: _.get(operation, "produces", []),
    };
  }

  private collectPaths(
    paths: OpenAPI.Document["paths"]
  ): ISwaggerWalker["paths"] {
    return _.map(paths, (path, $pattern) => ({
      ...path,
      $pattern,
      description: path.description || "",
      parameters: path.parameters || [],
      servers: path.servers || [],
      summary: path.summary || "",
      delete: this.createOperation($pattern, path.delete),
      get: this.createOperation($pattern, path.get),
      head: this.createOperation($pattern, path.head),
      patch: this.createOperation($pattern, path.patch),
      post: this.createOperation($pattern, path.post),
      put: this.createOperation($pattern, path.put),
      trace: this.createOperation($pattern, path.trace),
      options: this.createOperation($pattern, path.options),
    }));
  }

  private collectComponents(
    components: OpenAPI.Document["components"]
  ): ISwaggerWalker["components"] {
    return _.reduce(
      components,
      (acc, group, groupName) => {
        if (!acc[groupName as ComponentKinds]) {
          acc[groupName as ComponentKinds] = [];
        }

        _.each(group, (component, name) => {
          const newComponent: ISwaggerWalker["components"][keyof ISwaggerWalker["components"]][0] = {
            $kind: groupName as ComponentKinds,
            $name: name,
            ...component,
          };

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          acc[groupName as ComponentKinds].push(newComponent);
        });

        return acc;
      },
      {
        callbacks: [],
        examples: [],
        headers: [],
        links: [],
        parameters: [],
        requestBodies: [],
        responses: [],
        schemas: [],
        securitySchemes: [],
      }
    );
  }

  private collectSecurity(
    security: OpenAPI.Document["security"]
  ): ISwaggerWalker["security"] {
    return _.map(security);
  }

  private collectTags(tags: OpenAPI.Document["tags"]): ISwaggerWalker["tags"] {
    return _.map(tags, (tag) => {
      return _.merge<DeepRequired<OpenAPIV3.TagObject>, OpenAPIV3.TagObject>(
        {
          description: "",
          externalDocs: {
            description: "",
            url: "",
          },
          name: "",
        },
        tag
      );
    });
  }

  private collectExternalDocs(
    externalDocs: OpenAPI.Document["externalDocs"]
  ): ISwaggerWalker["externalDocs"] {
    return _.merge<
      ISwaggerWalker["externalDocs"],
      OpenAPI.Document["externalDocs"]
    >(
      {
        description: "",
        url: "",
      },
      externalDocs
    );
  }
}
