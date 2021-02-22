/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */
import { OpenAPIV3 } from "openapi-types";

export type StrictOpenAPIV3Doc = Required<
  Omit<
    OpenAPIV3.Document,
    | "x-express-openapi-additional-middleware"
    | "x-express-openapi-validation-strict"
  >
>;

export namespace OpenAPI {
  export type RawDocument = Omit<
    OpenAPIV3.Document,
    | "x-express-openapi-additional-middleware"
    | "x-express-openapi-validation-strict"
  >;
  export type RawStrictDocument = Required<RawDocument>;

  export interface MediaTypeObject {
    schema?: OpenAPIV3.SchemaObject;
    example?: unknown;
    examples?: {
      [media: string]: OpenAPIV3.ExampleObject;
    };
    encoding?: {
      [media: string]: OpenAPIV3.EncodingObject;
    };
  }

  export interface ParameterObject extends ParameterBaseObject {
    name: string;
    in: string;
  }
  export interface HeaderObject extends ParameterBaseObject {}
  export interface RequestBodyObject {
    description?: string;
    content: {
      [media: string]: MediaTypeObject;
    };
    required?: boolean;
  }
  type NonArraySchemaObjectType =
    | "boolean"
    | "object"
    | "number"
    | "string"
    | "integer";
  type ArraySchemaObjectType = "array";
  export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

  export interface BaseSchemaObject {
    $internalRef?: string;
    $referencedTo?: string;
    $recursiveReference?: boolean;
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
    enum?: any[];
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
    example?: any;
    deprecated?: boolean;
  }
  export interface ArraySchemaObject extends BaseSchemaObject {
    type: ArraySchemaObjectType;
    items: SchemaObject;
  }
  export interface NonArraySchemaObject extends BaseSchemaObject {
    type?: NonArraySchemaObjectType;
  }

  export interface ParameterBaseObject {
    $internalRef?: string;
    $referencedTo?: string;
    $recursiveReference?: boolean;
    description?: string;
    required?: boolean;
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
    content?: {
      [media: string]: OpenAPIV3.MediaTypeObject;
    };
  }

  export interface ResponseObject {
    description: string;
    headers?: {
      [header: string]: HeaderObject;
    };
    content?: {
      [media: string]: MediaTypeObject;
    };
    links?: {
      [link: string]: OpenAPIV3.LinkObject;
    };
  }
  export interface ResponsesObject {
    [code: string]: ResponseObject;
  }
  export interface CallbackObject {
    [url: string]: PathItemObject;
  }

  export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: OpenAPIV3.ExternalDocumentationObject;
    operationId?: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses?: ResponsesObject;
    callbacks?: {
      [callback: string]: CallbackObject;
    };
    deprecated?: boolean;
    security?: OpenAPIV3.SecurityRequirementObject[];
    servers?: OpenAPIV3.ServerObject[];
  }

  export interface PathItemObject {
    $internalRef?: string;
    $referencedTo?: string;
    $recursiveReference?: boolean;
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    servers?: OpenAPIV3.ServerObject[];
    parameters?: ParameterObject[];
  }

  export interface ComponentsObject {
    schemas?: {
      [key: string]: SchemaObject;
    };
    responses?: {
      [key: string]: ResponseObject;
    };
    parameters?: {
      [key: string]: ParameterObject;
    };
    examples?: {
      [key: string]: OpenAPIV3.ExampleObject;
    };
    requestBodies?: {
      [key: string]: RequestBodyObject;
    };
    headers?: {
      [key: string]: HeaderObject;
    };
    securitySchemes?: {
      [key: string]: OpenAPIV3.SecuritySchemeObject;
    };
    links?: {
      [key: string]: OpenAPIV3.LinkObject;
    };
    callbacks?: {
      [key: string]: CallbackObject;
    };
  }

  export interface Document {
    openapi: string;
    info: OpenAPIV3.InfoObject;
    servers?: OpenAPIV3.ServerObject[];
    paths: {
      [pattern: string]: PathItemObject;
    };
    components?: ComponentsObject;
    security?: OpenAPIV3.SecurityRequirementObject[];
    tags?: OpenAPIV3.TagObject[];
    externalDocs?: OpenAPIV3.ExternalDocumentationObject;
  }
}
