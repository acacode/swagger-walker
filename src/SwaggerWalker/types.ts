/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

import { OpenAPI } from "../interfaces/swagger";
import { DeepRequired } from "../types/common";

export namespace SwaggerWalkerInfo {
  export interface Document {
    openapi: string;
    info: DeepRequired<OpenAPIV3.InfoObject>;
    servers: OpenAPIV3.ServerObject[];
    paths: PathItemObject[];
    components: Components;
    security: OpenAPIV3.SecurityRequirementObject[];
    tags: DeepRequired<OpenAPIV3.TagObject>[];
    externalDocs: DeepRequired<OpenAPIV3.ExternalDocumentationObject>;
  }

  export interface PathItemObject extends OpenAPI.CompletedReferenceInfo {
    readonly $pattern: string;
    summary: string;
    description: string;
    get: OperationObject | null;
    put: OperationObject | null;
    post: OperationObject | null;
    delete: OperationObject | null;
    options: OperationObject | null;
    head: OperationObject | null;
    patch: OperationObject | null;
    trace: OperationObject | null;
    servers: OpenAPIV3.ServerObject[];
    parameters: ParameterObject[];
  }

  export interface OperationObject extends OpenAPI.CompletedReferenceInfo {
    readonly $pattern: string;
    readonly $method: string;
    consumes: OpenAPIV2.MimeTypes;
    produces: OpenAPIV2.MimeTypes;

    tags: string[];
    summary: string;
    description: string;
    externalDocs: Required<OpenAPIV3.ExternalDocumentationObject>;
    operationId: string | null;
    parameters: ParameterObject[];
    requestBody: RequestBody;
    responses: OpenAPI.ResponsesObject;
    callbacks: {
      [callback: string]: OpenAPI.CallbackObject;
    };
    deprecated: boolean;
    security: OpenAPIV3.SecurityRequirementObject[];
    servers: OpenAPIV3.ServerObject[];
  }

  type NonArraySchemaObjectType =
    | "boolean"
    | "object"
    | "number"
    | "string"
    | "integer";
  type ArraySchemaObjectType = "array";

  export interface BaseSchemaObject extends OpenAPI.CompletedReferenceInfo {
    title?: string;
    description?: string;
    format?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalProperties?: boolean | SchemaObject;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: unknown[];
    properties?: {
      [name: string]: SchemaObject;
    };
    allOf?: SchemaObject[];
    oneOf?: SchemaObject[];
    anyOf?: SchemaObject[];
    not?: SchemaObject;
    nullable?: boolean;
    discriminator?: OpenAPIV3.DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: OpenAPIV3.XMLObject;
    externalDocs?: OpenAPIV3.ExternalDocumentationObject;
    example?: unknown;
    deprecated?: boolean;
  }

  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  }
  export interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType;
  }

  export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

  export interface Components {
    schemas: (SchemaObject & ComponentExtras)[];
    responses: (ResponseObject & ComponentExtras)[];
    parameters: (ParameterObject & ComponentExtras)[];
    examples: (OpenAPIV3.ExampleObject & ComponentExtras)[];
    requestBodies: (OpenAPI.RequestBodyObject & ComponentExtras)[];
    headers: (HeaderObject & ComponentExtras)[];
    securitySchemes: (OpenAPIV3.SecuritySchemeObject & ComponentExtras)[];
    links: (OpenAPIV3.LinkObject & ComponentExtras)[];
    callbacks: (OpenAPI.CallbackObject & ComponentExtras)[];
  }

  export type ComponentKinds = keyof Components;

  export type ComponentValue = Components[ComponentKinds][0];

  export interface ComponentExtras {
    readonly $name: string;
    readonly $kind: ComponentKinds;
  }

  export interface MediaTypeObject {
    readonly $media: OpenAPIV2.MimeTypes[0];
    schema?: OpenAPIV3.SchemaObject;
    example?: unknown;
    nullable?: boolean;
    examples?: {
      [media: string]: OpenAPIV3.ExampleObject;
    };
    encoding?: {
      [media: string]: OpenAPIV3.EncodingObject;
    };
  }

  export interface RequestBody {
    description: string;
    mediaTypes: OpenAPIV2.MimeTypes;
    contents: MediaTypeObject[];
    required?: boolean;
  }

  interface ParameterBaseObject extends OpenAPI.CompletedReferenceInfo {
    description?: string;
    required?: boolean;
    nullable?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenAPIV3.SchemaObject;
    example?: unknown;
    examples?: {
      [media: string]: OpenAPIV3.ExampleObject;
    };
    content: MediaTypeObject[];
  }

  export interface ParameterObject extends ParameterBaseObject {
    name: string;
    in: string;
  }
  interface HeaderObject extends ParameterBaseObject {}

  interface ResponseObject extends OpenAPI.CompletedReferenceInfo {
    description: string;
    headers?: {
      [header: string]: HeaderObject;
    };
    content: MediaTypeObject[];
    links?: {
      [link: string]: OpenAPIV3.LinkObject;
    };
  }
}
