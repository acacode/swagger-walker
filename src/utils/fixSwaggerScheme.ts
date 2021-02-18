import _ from "lodash";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

export const fixSwaggerScheme = (
  usage: OpenAPIV3.Document,
  original: OpenAPIV3.Document | OpenAPIV2.Document
) => {
  const globalConsumes = _.get(original, "consumes", []);
  const globalProduces = _.get(original, "produces", []);

  const usagePaths = _.get(usage, "paths");
  const originalPaths = _.get(original, "paths");

  // walk by routes
  _.each(usagePaths, (usagePathObject, pathName) => {
    const originalPathObject = _.get(originalPaths, pathName);

    // walk by methods
    _.each(usagePathObject, (usageRouteInfo, methodName) => {
      const originalRouteInfo = _.get(originalPathObject, methodName);

      if (!originalRouteInfo) return;

      const usageRouteParams = _.get(usageRouteInfo, "parameters", []);
      const originalRouteParams = _.get(originalRouteInfo, "parameters", []);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usageRouteInfo.consumes = _.uniq(
        _.compact([
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...(usageRouteInfo.consumes || []),
          ...(originalRouteInfo.consumes || []),
          ...(globalConsumes || []),
        ])
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usageRouteInfo.produces = _.uniq(
        _.compact([
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...(usageRouteInfo.produces || []),
          ...(originalRouteInfo.produces || []),
          ...(globalProduces || []),
        ])
      );

      _.each(originalRouteParams, (originalRouteParam) => {
        const existUsageParam = _.find(
          usageRouteParams,
          (param) =>
            originalRouteParam.in === param.in &&
            originalRouteParam.name === param.name
        );
        if (!existUsageParam) {
          usageRouteParams.push(originalRouteParam);
        }
      });
    });
  });
};
