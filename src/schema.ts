import { z } from "zod";

type PropertySchemaBase = {
  name: string;
  type:
    | "string"
    | "integer"
    | "boolean"
    | "object"
    | "array"
    | "nunjucks-block";
  required?: boolean;
  description?: string;
};

type PropertySchema = PropertySchemaBase &
  (
    | {
        type: "string" | "integer" | "boolean" | "nunjucks-block";
        params?: undefined;
      }
    | {
        type: "object";
        params?: PropertySchema[];
      }
    | {
        type: "array";
        params?: PropertySchema[];
      }
  );

export type ComponentSchema = {
  params: PropertySchema[];
};

const createParamSchema = (
  componentName: string,
  param: PropertySchema
): z.ZodTypeAny => {
  const paramType =
    param.type === "boolean"
      ? z.boolean()
      : param.type === "string"
      ? z.string()
      : param.type === "integer"
      ? z.number().int().safe()
      : param.type === "nunjucks-block"
      ? z.string()
      : param.type === "array"
      ? createArraySchema(componentName, param.params)
      : param.type === "object"
      ? createObjectSchema(componentName, param.params)
      : z.unknown();

  // Work around the undeclared nested array in the table component
  if (componentName === "table" && param.name === "rows" && param.params) {
    return z.array(z.array(createObjectSchema(componentName, param.params)));
  }

  // Work around mutually exclusive text & html properties both being `required`
  const textProps = /\b(?:\w*)[Tt]ext$/;
  const htmlProps = /\b(?:\w*)[Hh]tml$/;
  if (textProps.test(param.name) || htmlProps.test(param.name)) {
    return z.optional(paramType);
  }

  return param.required ? paramType : z.optional(paramType);
};

const createParamsSchema = (
  componentName: string,
  params: PropertySchema[]
) => {
  return z.object(
    Object.assign(
      {},
      ...params.map((param) => ({
        [param.name]: createParamSchema(componentName, param),
      }))
    )
  );
};

const createObjectSchema = (
  componentName: string,
  params: PropertySchema[] | undefined
) => {
  const objectShape = params
    ? createParamsSchema(componentName, params)
    : z.object({});
  return objectShape.catchall(z.unknown());
};

const createArraySchema = (
  componentName: string,
  params: PropertySchema[] | undefined
) => {
  return params
    ? z.array(createObjectSchema(componentName, params))
    : z.array(z.unknown());
};

const preProcessSchema = (params: PropertySchema[]): PropertySchema[] => {
  if (params.length === 0) {
    return params;
  }

  const empty: { [key: string]: PropertySchema[] } = {};

  // Group by the dotted prefix
  const groupedParams = params.reduce((grouped, param) => {
    const path = param.name.split(".")[0] || param.name;
    const group = grouped[path];
    if (group) {
      group.push(param);
      return grouped;
    } else {
      return { ...grouped, [path]: [param] };
    }
  }, empty);

  const preProcessed: PropertySchema[] = Object.entries(groupedParams).map(
    ([path, innerParams]) => {
      innerParams.forEach((innerParam) => {
        const paramSegments = innerParam.name.split(".");
        if (paramSegments.length > 1) {
          // None of the current params in govuk-frontend have more than two segments
          innerParam.name = paramSegments[1] || innerParam.name;
        }
        if (innerParam.params) {
          innerParam.params = preProcessSchema(innerParam.params);
        }
      });

      if (innerParams.length === 1 && innerParams[0]) {
        // This is a singleton group
        return innerParams[0];
      } else {
        // Create a synthetic object to hold the grouped parameters of this prefix
        return {
          name: path,
          type: "object",
          required: true,
          // Some parameters collide with this synthetic object
          params: innerParams.filter((innerParam) => innerParam.name !== path),
        };
      }
    }
  );

  return preProcessed;
};

export const createZodSchema = (
  componentName: string,
  data: ComponentSchema
) => {
  return z.object({
    params: createParamsSchema(componentName, preProcessSchema(data.params)),
  });
};
