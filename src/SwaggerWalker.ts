/* eslint-disable max-lines */
import _ from "lodash";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { OpenAPI } from "./interfaces/swagger";
import { DeepRequired, ValueOf } from "./types/common";

type ComponentKinds = keyof ISwaggerWalker["components"];

interface ComponentExtras {
  $name: string;
  $kind: ComponentKinds;
}

interface SwaggerWalkerPathOperation {
  $pattern: string;
  $method: string;
  $internalRef: string;
  consumes: OpenAPIV2.MimeTypes;
  produces: OpenAPIV2.MimeTypes;

  tags: string[];
  summary: string;
  description: string;
  externalDocs: OpenAPIV3.ExternalDocumentationObject;
  operationId: string | null;
  parameters: OpenAPI.ParameterObject[];
  requestBody: Required<OpenAPI.RequestBodyObject>;
  responses: OpenAPI.ResponsesObject;
  callbacks: {
    [callback: string]: OpenAPI.CallbackObject;
  };
  deprecated: boolean;
  security: OpenAPIV3.SecurityRequirementObject[];
  servers: OpenAPIV3.ServerObject[];
}

interface SwaggerWalkerPath {
  $pattern: string;
  $referencedTo?: string;
  $internalRef: string;
  summary: string;
  description: string;
  get: SwaggerWalkerPathOperation | null;
  put: SwaggerWalkerPathOperation | null;
  post: SwaggerWalkerPathOperation | null;
  delete: SwaggerWalkerPathOperation | null;
  options: SwaggerWalkerPathOperation | null;
  head: SwaggerWalkerPathOperation | null;
  patch: SwaggerWalkerPathOperation | null;
  trace: SwaggerWalkerPathOperation | null;
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
  // $refsMap = new Map<string, unknown>();

  openapi: ISwaggerWalker["openapi"];
  info: ISwaggerWalker["info"];
  servers: ISwaggerWalker["servers"];
  paths: ISwaggerWalker["paths"];
  components: ISwaggerWalker["components"];
  security: ISwaggerWalker["security"];
  tags: ISwaggerWalker["tags"];
  externalDocs: ISwaggerWalker["externalDocs"];

  constructor(
    public document: OpenAPI.Document,
    public original: OpenAPIV3.Document | OpenAPIV2.Document,
    public convertedFromSwagger2: boolean = false
  ) {
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

  private createParameter = (
    parameter: OpenAPI.ParameterObject
  ): OpenAPI.ParameterObject => {
    return parameter;
  };

  private createOperation(
    $pattern: string,
    $method: string,
    rawOperation?: OpenAPI.OperationObject
  ): null | SwaggerWalkerPathOperation {
    if (!rawOperation) return null;

    const $internalRef = `#/paths/${$pattern}/${$method}`;

    const operation: SwaggerWalkerPathOperation = {
      ...rawOperation,
      $pattern,
      $method,
      $internalRef,
      tags: rawOperation.tags || [],
      callbacks: rawOperation.callbacks || {},
      deprecated: !!rawOperation.deprecated,
      externalDocs: _.merge<
        SwaggerWalkerPathOperation["externalDocs"],
        OpenAPI.OperationObject["externalDocs"]
      >(
        {
          url: "",
          description: "",
        },
        rawOperation.externalDocs
      ),
      operationId: rawOperation.operationId || null,
      parameters: _.uniqBy(
        [
          ..._.map(rawOperation.parameters || [], this.createParameter),
          ..._.reduce<string, OpenAPI.ParameterObject[]>(
            ($pattern || "").match(
              /({(([a-zA-Z]-?_?){1,})([0-9]{1,})?})|(:(([a-zA-Z]-?_?){1,})([0-9]{1,})?:?)/g
            ),
            (acc, match) => {
              return [
                ...acc,
                this.createParameter({
                  name: _.replace(match, /\{|\}|:/g, ""),
                  required: true,
                  description: "",
                  schema: {
                    type: "string",
                  },
                  in: "path",
                }),
              ];
            },
            []
          ),
        ],
        (paramter) => `${paramter.name}-${paramter.in}`
      ),
      requestBody: _.merge<
        SwaggerWalkerPathOperation["requestBody"],
        OpenAPI.OperationObject["requestBody"]
      >(
        {
          content: {},
          description: "",
          required: false,
        },
        rawOperation.requestBody
      ),
      responses: rawOperation.responses || {},
      security: rawOperation.security || [],
      servers: rawOperation.servers || [],
      summary: rawOperation.summary || "",
      description: rawOperation.description || "",
      consumes: _.get(rawOperation, "consumes", []),
      produces: _.get(rawOperation, "produces", []),
    };

    // this.$refsMap.set($internalRef, operation);

    return operation;
  }

  private collectPaths(
    paths: OpenAPI.Document["paths"]
  ): ISwaggerWalker["paths"] {
    return _.map(paths, (rawPath, $pattern) => {
      const $internalRef = `#/paths/${$pattern}`;

      const path: SwaggerWalkerPath = {
        ...rawPath,
        $pattern,
        $internalRef,
        description: rawPath.description || "",
        parameters: rawPath.parameters || [],
        servers: rawPath.servers || [],
        summary: rawPath.summary || "",
        delete: this.createOperation($pattern, "delete", rawPath.delete),
        get: this.createOperation($pattern, "get", rawPath.get),
        head: this.createOperation($pattern, "head", rawPath.head),
        patch: this.createOperation($pattern, "patch", rawPath.patch),
        post: this.createOperation($pattern, "post", rawPath.post),
        put: this.createOperation($pattern, "put", rawPath.put),
        trace: this.createOperation($pattern, "trace", rawPath.trace),
        options: this.createOperation($pattern, "options", rawPath.options),
      };

      // this.$refsMap.set($internalRef, path);

      return path;
    });
  }

  private collectComponents(
    components: OpenAPI.Document["components"]
  ): ISwaggerWalker["components"] {
    return _.reduce<OpenAPI.ComponentsObject, ISwaggerWalker["components"]>(
      components,
      (acc, group, groupName) => {
        if (!acc[groupName as ComponentKinds]) {
          acc[groupName as ComponentKinds] = [];
        }

        _.each(group, (component, name) => {
          const newComponent: ValueOf<ISwaggerWalker["components"]>[0] = {
            $kind: groupName as ComponentKinds,
            $name: name,
            ...component,
          };

          (acc as {
            [key: string]: ValueOf<ISwaggerWalker["components"]>[0][];
          })[groupName].push(newComponent);
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
