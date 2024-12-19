import { stripIndent } from "common-tags";
import http from "http";
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "./server";
import { createTmpDir } from "./tmpdir";

let server: http.Server;
let request: TestAgent;

beforeAll(async () => {
  const tmpDir = await createTmpDir();
  server = createServer(tmpDir).listen(0);
  request = supertest(server);
});

afterAll(async () => {
  new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe.each(["4.9.0", "5.7.1"])(
  "Nunjucks renderer (GOV.UK Frontend %s)",
  (govukVersion) => {
    it("should reject content types other than application/json", async () => {
      await request
        .post(`/govuk/${govukVersion}/components/summary-list`)
        .set("Accept", "text/html")
        .set("Content-Type", "application/x-yaml")
        .send('{ "params": [] }')
        .expect(415);
    }, 10000);

    it("should reject accepted types other than text/html", async () => {
      await request
        .post(`/govuk/${govukVersion}/components/summary-list`)
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send('{ "params": [] }')
        .expect(406);
    }, 10000);

    it("should reject invalid parameter specifications", async () => {
      const response = await request
        .post(`/govuk/${govukVersion}/components/summary-list`)
        .set("Accept", "text/html")
        .set("Content-Type", "application/json")
        .send('{ "params": [] }')
        .expect(400);

      expect(JSON.parse(response.text)).toEqual([
        {
          code: "invalid_type",
          expected: "object",
          message: "Expected object, received array",
          path: ["params"],
          received: "array",
        },
      ]);
    }, 10000);

    it("should accept valid parameter specifications", async () => {
      const response = await request
        .post(`/govuk/${govukVersion}/components/accordion`)
        .set("Accept", "text/html")
        .set("Content-Type", "application/json")
        .send('{ "params": {"id": "bla", "items":[]} }')
        .expect(200);

      expect(response.text.trim()).toEqual(stripIndent`
      <div class="govuk-accordion" data-module="govuk-accordion" id="bla">\n  \n</div>
    `);
    }, 10000);
  },
);
