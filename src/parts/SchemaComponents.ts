import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";

import { SwaggerWalker } from "../SwaggerWalker";
import { InferRecordValue, ValueOf } from "../types/common";
import { isReferenceObject } from "../utils/isReferenceObject";

import { CallbackComponent } from "./components/CallbackComponent";
import { ExampleComponent } from "./components/ExampleComponent";
import { HeaderComponent } from "./components/HeaderComponent";
import { LinkComponent } from "./components/LinkComponent";
import { ParameterComponent } from "./components/ParameterComponent";
import { RequestBodyComponent } from "./components/RequestBodyComponent";
import { ResponseComponent } from "./components/ResponseComponent";
import { SchemaComponent } from "./components/SchemaComponent";
import { SecuritySchemaComponent } from "./components/SecuritySchemaComponent";
import { ComponentWrapper, ComponentWrapperParams } from "./ComponentWrapper";

export type ComponentKinds = keyof OpenAPIV3.ComponentsObject;
export type ComponentObjectValues = ValueOf<OpenAPIV3.ComponentsObject>;
export type ComponentType = Exclude<
  InferRecordValue<ComponentObjectValues>,
  OpenAPIV3.ReferenceObject
>;

export type FindComponentQuery = {
  kind: ComponentKinds;
  name: string;
};

export type ISchemaComponents = {
  [K in keyof OpenAPIV3.ComponentsObject]: OpenAPIV3.ComponentsObject[K] extends {
    [key: string]: infer T;
  }
    ? Exclude<T, OpenAPIV3.ReferenceObject>
    : never;
};

const COMPONENT_WRAPPER: Record<
  ComponentKinds,
  new (params: ComponentWrapperParams) => ComponentWrapper
> = {
  callbacks: CallbackComponent,
  examples: ExampleComponent,
  headers: HeaderComponent,
  links: LinkComponent,
  parameters: ParameterComponent,
  requestBodies: RequestBodyComponent,
  responses: ResponseComponent,
  schemas: SchemaComponent,
  securitySchemes: SecuritySchemaComponent,
};

export class SchemaComponents {
  values: ComponentWrapper[] = [];

  constructor(private walker: SwaggerWalker) {
    // ComponentsObject
    this.values = _.reduce<OpenAPIV3.ComponentsObject, ComponentWrapper[]>(
      walker.schema.components,
      (values, group, groupName) => {
        const Wrapper = COMPONENT_WRAPPER[groupName as ComponentKinds];
        const components = _.map(group, (value, name) => {
          return new Wrapper({
            value: value as ComponentType,
            kind: groupName as ComponentKinds,
            name,
            walker: this.walker,
          });
        });

        return [...values, ...components];
      },
      []
    );
  }

  // find<T extends SchemaComponent>({
  //   kind,
  //   name,
  // }: FindComponentQuery): T | null {
  //   const component =
  //     this.values.find(
  //       (component) => component.name === name && component.kind === kind
  //     ) || null;

  //   if (!component) {
  //     console.warn(
  //       "SchemaComponents > getComponent > no components by this query:",
  //       kind,
  //       name
  //     );
  //     return null;
  //   }

  //   return null;
  // if (!component.$parsed && isReferenceObject(component.value)) {
  //   const refData = this.walker.findByRef<T>(component.value);

  //   // component.setRefData(refData as ComponentType);
  // }

  // return component.value as T;
  // }
}
