/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-lines */
import _ from "lodash";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { OpenAPI } from "../interfaces/swagger";
import { DeepRequired, ValueOf } from "../types/common";
import { isNullable } from "../utils/isNullable";

import { SwaggerWalkerInfo } from "./types";

export class SwaggerWalker implements SwaggerWalkerInfo.Document {
  // $refsMap = new Map<string, unknown>();

  openapi: SwaggerWalkerInfo.Document["openapi"];
  info: SwaggerWalkerInfo.Document["info"];
  servers: SwaggerWalkerInfo.Document["servers"];
  paths: SwaggerWalkerInfo.Document["paths"];
  components: SwaggerWalkerInfo.Document["components"];
  security: SwaggerWalkerInfo.Document["security"];
  tags: SwaggerWalkerInfo.Document["tags"];
  externalDocs: SwaggerWalkerInfo.Document["externalDocs"];

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

  private collectInfo(
    info: OpenAPI.Document["info"]
  ): SwaggerWalkerInfo.Document["info"] {
    return _.merge<
      SwaggerWalkerInfo.Document["info"],
      OpenAPI.Document["info"]
    >(
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
  ): SwaggerWalkerInfo.Document["servers"] {
    return _.compact(servers);
  }

  private collectMediaTypeObjects(
    mediaObjects?: Record<string, OpenAPI.MediaTypeObject>
  ): SwaggerWalkerInfo.MediaTypeObject[] {
    return _.map(mediaObjects, (mediaObject, $media) => ({
      ...mediaObject,
      $media,
    }));
  }

  private createParameter = (
    parameter: OpenAPI.ParameterObject
  ): SwaggerWalkerInfo.ParameterObject => {
    return {
      ...parameter,
      content: this.collectMediaTypeObjects(parameter.content),
      nullable: isNullable(parameter),
    };
  };

  private createOperation(
    $pattern: string,
    $method: string,
    rawOperation?: OpenAPI.OperationObject
  ): null | SwaggerWalkerInfo.OperationObject {
    if (!rawOperation) return null;

    const operation: SwaggerWalkerInfo.OperationObject = {
      ...rawOperation,
      $pattern,
      $method,
      $internalRef: ["paths", $pattern, $method],
      tags: _.compact(rawOperation.tags) || [],
      callbacks: rawOperation.callbacks || {},
      deprecated: !!rawOperation.deprecated,
      externalDocs: _.merge<
        SwaggerWalkerInfo.OperationObject["externalDocs"],
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
          ..._.map(
            _.compact(rawOperation.parameters || []),
            this.createParameter
          ),
          ..._.reduce<string, SwaggerWalkerInfo.ParameterObject[]>(
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
      requestBody: this.createRequestBody(rawOperation.requestBody),
      responses: rawOperation.responses || {},
      security: _.compact(rawOperation.security || []),
      servers: _.compact(rawOperation.servers || []),
      summary: rawOperation.summary || "",
      description: rawOperation.description || "",
      consumes: _.get(rawOperation, "consumes", []),
      produces: _.get(rawOperation, "produces", []),
    };

    // this.$refsMap.set($internalRef, operation);

    return operation;
  }

  private createRequestBody(
    requestBody?: OpenAPI.OperationObject["requestBody"]
  ): SwaggerWalkerInfo.RequestBody {
    const { required, content, description } = requestBody || {};
    const mediaTypes = _.keys(content);
    //
    return {
      required: !!required,
      mediaTypes,
      description: description || "",
      contents: _.map(mediaTypes, (mediaType) => ({
        ...(_.get(content, mediaType) || {}),
        $media: mediaType,
      })),
    };
  }

  private collectPaths(
    paths: OpenAPI.Document["paths"]
  ): SwaggerWalkerInfo.Document["paths"] {
    return _.reduce<
      Record<string, OpenAPI.PathItemObject>,
      SwaggerWalkerInfo.Document["paths"]
    >(
      paths,
      (walkerPaths, rawPath, $pattern) => {
        // TODO?
        if (_.startsWith($pattern, "x-")) return walkerPaths;

        const methods = [
          "delete",
          "get",
          "head",
          "patch",
          "post",
          "put",
          "trace",
          "options",
        ] as const;

        type Accumulator = Pick<
          SwaggerWalkerInfo.PathItemObject,
          Extract<ValueOf<typeof methods>, string> | "$operations"
        >;

        const pathObjectPart = methods.reduce<Accumulator>(
          (acc, method) => {
            const operation = this.createOperation(
              $pattern,
              method,
              (rawPath[method as keyof OpenAPI.PathItemObject] as unknown) as
                | OpenAPI.OperationObject
                | undefined
            );

            acc[method] = operation;

            if (operation) {
              acc.$operations.push(operation);
            }

            return acc;
          },
          {
            $operations: [],
            delete: null,
            get: null,
            head: null,
            patch: null,
            post: null,
            put: null,
            trace: null,
            options: null,
          }
        );

        const path: SwaggerWalkerInfo.PathItemObject = {
          ...rawPath,
          $pattern,
          $internalRef: ["paths", $pattern],
          description: rawPath.description || "",
          parameters: _.map(rawPath.parameters || [], this.createParameter),
          servers: rawPath.servers || [],
          summary: rawPath.summary || "",
          ...pathObjectPart,
        };

        // this.$refsMap.set($internalRef, path);

        return [...walkerPaths, path];
      },
      []
    );
  }

  private collectComponents(
    components: OpenAPI.Document["components"]
  ): SwaggerWalkerInfo.Components {
    return _.reduce<OpenAPI.ComponentsObject, SwaggerWalkerInfo.Components>(
      components,
      (acc, group, groupName) => {
        if (!acc[groupName as SwaggerWalkerInfo.ComponentKinds]) {
          acc[groupName as SwaggerWalkerInfo.ComponentKinds] = [];
        }

        _.each(group, (component, name) => {
          const newComponent = this.createComponent(
            groupName as SwaggerWalkerInfo.ComponentKinds,
            name,
            component
          );

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          acc[groupName].push(newComponent);
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

  private createComponent(
    kind: SwaggerWalkerInfo.ComponentKinds,
    name: string,
    component: OpenAPI.ComponentValue
  ): SwaggerWalkerInfo.ComponentValue {
    const extras: SwaggerWalkerInfo.ComponentExtras = {
      $kind: kind,
      $name: name,
    };

    switch (kind) {
      case "schemas": {
        const schema = component as OpenAPI.SchemaObject;

        const properties = schema.properties
          ? { properties: schema.properties }
          : null;

        return {
          ...extras,
          ...schema,
          $internalRef: ["components", kind, name],
          nullable: isNullable(schema),
          ...(properties ? { properties } : {}),
        };
      }
      default: {
        return {
          $internalRef: ["components", kind, name],
          ...extras,
          ...component,
        };
      }
    }
  }

  private collectSecurity(
    security: OpenAPI.Document["security"]
  ): SwaggerWalkerInfo.Document["security"] {
    return _.map(security);
  }

  private collectTags(
    tags: OpenAPI.Document["tags"]
  ): SwaggerWalkerInfo.Document["tags"] {
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
  ): SwaggerWalkerInfo.Document["externalDocs"] {
    return _.merge<
      SwaggerWalkerInfo.Document["externalDocs"],
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
