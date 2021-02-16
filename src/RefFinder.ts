import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";

import { isReferenceObject } from "./utils/isReferenceObject";

type FoundByRefDocument =
  | OpenAPIV3.SchemaObject
  | OpenAPIV3.SchemaObject
  | OpenAPIV3.HeaderObject
  | OpenAPIV3.ResponseObject
  | OpenAPIV3.LinkObject
  | OpenAPIV3.ParameterObject
  | OpenAPIV3.ExampleObject
  | OpenAPIV3.RequestBodyObject
  | OpenAPIV3.HeaderObject
  | OpenAPIV3.SecuritySchemeObject
  | OpenAPIV3.LinkObject
  | OpenAPIV3.CallbackObject;

type RawRefType = unknown;

export class RefFinder {
  parsedRefs = new Map<string, unknown>();

  constructor(private _schema: OpenAPIV3.Document) {}

  public findByRef<T extends FoundByRefDocument>(
    rawRef?: RawRefType
  ): (T & { refName: string }) | null {
    if (!rawRef) return null;

    let ref: string | null = null;

    // TODO

    if (typeof rawRef === "string") {
      ref = this.reconcileRef(rawRef);
    }
    if (isReferenceObject(rawRef)) {
      ref = this.reconcileRef(rawRef.$ref);
    }

    if (!ref) {
      console.warn("swagger-walker > findByRef > ref is empty", ref);
      return null;
    }

    const parts = ref.split("/").filter((part) => part && part !== "#");

    const foundDocument = _.get(this._schema, parts, null) as T | null;

    if (!foundDocument) {
      console.warn(
        "swagger-walker > findByRef > document by ref not found",
        ref
      );
      return null;
    }

    return {
      ...foundDocument,
      refName: ref,
    };
  }
  public setParsedData<T>(ref: string, value: T) {
    this.parsedRefs.set(ref, value);
  }

  public findParsedByRef<T>(ref: string): T | null {
    return (this.parsedRefs.get(ref) || null) as T | null;
  }

  private reconcileRef(ref: string): string {
    const replaces = [
      ["#/parameters/", "#/components/parameters/"],
      ["#/responses/", "#/components/responses/"],
      ["#/definitions/", "#/components/schemas/"],
    ] as const;

    return _.reduce(
      replaces,
      (result, replace) => _.replace(result, replace[0], replace[1]),
      ref
    );
  }
}
