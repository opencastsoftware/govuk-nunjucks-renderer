import { describe, expect, it } from "vitest";
import { createZodSchema } from "./schema";

describe("createZodSchema", () => {
  describe("generating a schema for a component with no parameters", () => {
    const schema = createZodSchema("component", { params: [] });
    it("should allow an empty parameter object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeTruthy();
    });
    it("should allow extra data", () => {
      const result = schema.safeParse({ params: { foo: true } });
      expect(result.success).toBeTruthy();
    });
    it("should reject missing params object", () => {
      const arr = schema.safeParse({});
      expect(arr.success).toBeFalsy();
    });
    it("should reject incorrect params type", () => {
      const arr = schema.safeParse({ params: [] });
      expect(arr.success).toBeFalsy();
      const bool = schema.safeParse({ params: true });
      expect(bool.success).toBeFalsy();
      const str = schema.safeParse({ params: "bla" });
      expect(str.success).toBeFalsy();
      const num = schema.safeParse({ params: 123 });
      expect(num.success).toBeFalsy();
    });
  });

  describe("generating a schema for an object with simple required parameters", () => {
    const schema = createZodSchema("component", {
      params: [
        { name: "foo", type: "string", required: true },
        { name: "bar", type: "boolean", required: true },
        { name: "baz", type: "integer", required: true },
        { name: "quu", type: "nunjucks-block", required: true },
      ],
    });

    it("should allow a fully populated parameter object", () => {
      const result = schema.safeParse({
        params: {
          foo: "bla",
          bar: true,
          baz: 1,
          quu: "<p>1</p>",
        },
      });

      expect(result.success).toBeTruthy();
    });

    it("should require that parameters conform to their expected type", () => {
      const data = {
        params: {
          foo: "bla",
          bar: true,
          baz: 1,
          quu: "<p>1</p>",
        },
      };

      const incorrectNum = schema.safeParse({
        params: { ...data.params, foo: 1 },
      });
      expect(incorrectNum.success).toBeFalsy();

      const incorrectStr = schema.safeParse({
        params: { ...data.params, bar: "bla" },
      });
      expect(incorrectStr.success).toBeFalsy();

      const incorrectBool = schema.safeParse({
        params: { ...data.params, baz: true },
      });
      expect(incorrectBool.success).toBeFalsy();

      const anotherIncorrectBool = schema.safeParse({
        params: { ...data.params, quu: true },
      });
      expect(anotherIncorrectBool.success).toBeFalsy();
    });

    it("should not allow an empty parameter object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeFalsy();
    });
  });

  describe("generating a schema for an object with simple optional parameters", () => {
    const schema = createZodSchema("component", {
      params: [
        { name: "foo", type: "string", required: false },
        { name: "bar", type: "boolean", required: false },
        { name: "baz", type: "integer", required: false },
        { name: "quu", type: "nunjucks-block", required: false },
      ],
    });

    it("should allow a fully populated parameter object", () => {
      const result = schema.safeParse({
        params: {
          foo: "bla",
          bar: true,
          baz: 1,
          quu: "<p>1</p>",
        },
      });

      expect(result.success).toBeTruthy();
    });

    it("should require that parameters conform to their expected type", () => {
      const input = {
        params: {
          foo: "bla",
          bar: true,
          baz: 1,
          quu: "<p>1</p>",
        },
      };

      const incorrectNum = schema.safeParse({
        params: { ...input.params, foo: 1 },
      });
      expect(incorrectNum.success).toBeFalsy();

      const incorrectStr = schema.safeParse({
        params: { ...input.params, bar: "bla" },
      });
      expect(incorrectStr.success).toBeFalsy();

      const incorrectBool = schema.safeParse({
        params: { ...input.params, baz: true },
      });
      expect(incorrectBool.success).toBeFalsy();

      const anotherIncorrectBool = schema.safeParse({
        params: { ...input.params, quu: true },
      });
      expect(anotherIncorrectBool.success).toBeFalsy();
    });

    it("should allow an empty parameter object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeTruthy();
    });

    it("should allow a partially populated parameter object", () => {
      const hasFoo = schema.safeParse({ params: { foo: "bla" } });
      expect(hasFoo.success).toBeTruthy();
      const hasBar = schema.safeParse({ params: { bar: false } });
      expect(hasBar.success).toBeTruthy();
    });
  });

  describe("generating a schema for a component with an object parameter with no declared fields", () => {
    const schema = createZodSchema("component", {
      params: [
        {
          name: "data",
          type: "object",
          required: true,
        },
      ],
    });

    it("should not allow an empty parameter object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeFalsy();
    });

    it("should allow an empty params.data object", () => {
      const result = schema.safeParse({ params: { data: {} } });
      expect(result.success).toBeTruthy();
    });

    it("should allow the parameter object to have extra data", () => {
      const result = schema.safeParse({
        params: {
          data: {
            foo: "bla",
            bar: true,
            baz: 1,
            quu: "<p>1</p>",
          },
        },
      });

      expect(result.success).toBeTruthy();
    });
  });

  describe("generating a schema for a component with an array parameter with no declared fields", () => {
    const schema = createZodSchema("component", {
      params: [
        {
          name: "data",
          type: "array",
          required: true,
        },
      ],
    });

    it("should not allow an empty parameter object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeFalsy();
    });

    it("should allow an empty params.data array", () => {
      const result = schema.safeParse({ params: { data: [] } });
      expect(result.success).toBeTruthy();
    });

    it("should allow the params.data array to have variously-typed data", () => {
      const result = schema.safeParse({
        params: {
          data: ["bla", 1, true],
        },
      });

      expect(result.success).toBeTruthy();
    });
  });

  describe("generating a schema for a component with a required object parameter", () => {
    const schema = createZodSchema("component", {
      params: [
        {
          name: "data",
          type: "object",
          required: true,
          params: [
            { name: "foo", type: "string", required: false },
            { name: "bar", type: "boolean", required: false },
            { name: "baz", type: "integer", required: false },
            { name: "quu", type: "nunjucks-block", required: false },
          ],
        },
      ],
    });

    it("should allow a fully populated parameter object", () => {
      const result = schema.safeParse({
        params: {
          data: {
            foo: "bla",
            bar: true,
            baz: 1,
            quu: "<p>1</p>",
          },
        },
      });

      expect(result.success).toBeTruthy();
    });

    it("should require that parameters conform to their expected type", () => {
      const input = {
        params: {
          data: {
            foo: "bla",
            bar: true,
            baz: 1,
            quu: "<p>1</p>",
          },
        },
      };

      const incorrectNum = schema.safeParse({
        params: { data: { ...input.params.data, foo: 1 } },
      });
      expect(incorrectNum.success).toBeFalsy();

      const incorrectStr = schema.safeParse({
        params: { data: { ...input.params.data, bar: "bla" } },
      });
      expect(incorrectStr.success).toBeFalsy();

      const incorrectBool = schema.safeParse({
        params: { data: { ...input.params.data, baz: true } },
      });
      expect(incorrectBool.success).toBeFalsy();

      const anotherIncorrectBool = schema.safeParse({
        params: { data: { ...input.params.data, quu: true } },
      });
      expect(anotherIncorrectBool.success).toBeFalsy();
    });

    it("should not allow an empty params object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeFalsy();
    });

    it("should allow an empty params.data object", () => {
      const result = schema.safeParse({ params: { data: {} } });
      expect(result.success).toBeTruthy();
    });

    it("should allow a partially populated params.data object", () => {
      const hasFoo = schema.safeParse({ params: { data: { foo: "bla" } } });
      expect(hasFoo.success).toBeTruthy();
      const hasBar = schema.safeParse({ params: { data: { bar: false } } });
      expect(hasBar.success).toBeTruthy();
    });
  });

  describe("generating a schema for a component with a required array parameter", () => {
    const schema = createZodSchema("component", {
      params: [
        {
          name: "data",
          type: "array",
          required: true,
          params: [
            { name: "foo", type: "string", required: false },
            { name: "bar", type: "boolean", required: false },
            { name: "baz", type: "integer", required: false },
            { name: "quu", type: "nunjucks-block", required: false },
          ],
        },
      ],
    });

    it("should allow an empty params.data array", () => {
      const result = schema.safeParse({ params: { data: [] } });
      expect(result.success).toBeTruthy();
    });

    it("should allow a fully populated params.data array", () => {
      const result = schema.safeParse({
        params: {
          data: [
            {
              foo: "bla",
              bar: true,
              baz: 1,
              quu: "<p>1</p>",
            },
          ],
        },
      });

      expect(result.success).toBeTruthy();
    });

    it("should require that parameters conform to their expected type", () => {
      const input = {
        params: {
          data: {
            foo: "bla",
            bar: true,
            baz: 1,
            quu: "<p>1</p>",
          },
        },
      };

      const incorrectNum = schema.safeParse({
        params: { data: [{ ...input.params.data, foo: 1 }] },
      });
      expect(incorrectNum.success).toBeFalsy();

      const incorrectStr = schema.safeParse({
        params: { data: [{ ...input.params.data, bar: "bla" }] },
      });
      expect(incorrectStr.success).toBeFalsy();

      const incorrectBool = schema.safeParse({
        params: { data: [{ ...input.params.data, baz: true }] },
      });
      expect(incorrectBool.success).toBeFalsy();

      const anotherIncorrectBool = schema.safeParse({
        params: { data: [{ ...input.params.data, quu: true }] },
      });
      expect(anotherIncorrectBool.success).toBeFalsy();
    });

    it("should not allow an empty params object", () => {
      const result = schema.safeParse({ params: {} });
      expect(result.success).toBeFalsy();
    });

    it("should allow a partially populated params.data array entry", () => {
      const hasFoo = schema.safeParse({ params: { data: [{ foo: "bla" }] } });
      expect(hasFoo.success).toBeTruthy();
      const hasBar = schema.safeParse({ params: { data: [{ bar: false }] } });
      expect(hasBar.success).toBeTruthy();
    });
  });
});
