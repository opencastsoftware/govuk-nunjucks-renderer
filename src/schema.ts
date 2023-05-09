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

const createParamSchema = (param: PropertySchema): z.ZodTypeAny => {
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
      ? createArraySchema(param.params)
      : param.type === "object"
      ? createObjectSchema(param.params)
      : z.unknown();

  return param.required ? paramType : z.optional(paramType);
};

const createParamsSchema = (params: PropertySchema[]) => {
  return z.object(
    Object.assign(
      {},
      ...params.map((param) => ({ [param.name]: createParamSchema(param) }))
    )
  );
};

const createObjectSchema = (params: PropertySchema[] | undefined) => {
  const objectShape = params ? createParamsSchema(params) : z.object({});
  return objectShape.catchall(z.unknown());
};

const createArraySchema = (params: PropertySchema[] | undefined) => {
  return params ? z.array(createObjectSchema(params)) : z.array(z.unknown());
};

export const createZodSchema = (data: ComponentSchema) => {
  return z.object({
    params: createParamsSchema(data.params),
  });
};
