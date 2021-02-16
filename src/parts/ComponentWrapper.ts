import { OpenAPIV3 } from "openapi-types";

import { SwaggerWalker } from "../SwaggerWalker";
import { isReferenceObject } from "../utils/isReferenceObject";

import { ComponentKinds, ComponentType } from "./SchemaComponents";

export interface ComponentWrapperParams {
  value: ComponentType;
  kind: ComponentKinds;
  name: string;
  walker: SwaggerWalker;
}

export class ComponentWrapper implements ComponentWrapperParams {
  constructor(params: ComponentWrapperParams) {
    Object.assign(this, params);

    if (isReferenceObject(this.value)) {
      const referenceValue =
        this.walker.findByRef<ComponentType>(this.value) || {};

      this.value = referenceValue;
    }
  }
  value!: ComponentType;
  kind!: keyof OpenAPIV3.ComponentsObject;
  name!: string;
  walker!: SwaggerWalker;
}
