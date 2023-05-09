import { stripIndent } from "common-tags";
import { fetchPropertySchema, fetchTemplateFile, fetchTemplateImport } from "./github";
import nock from "nock";

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe("fetchPropertySchema", () => {
  it("should return parameter schema YAML file", async () => {
    const mockSchema = stripIndent`
      params:
        - name: "bla"
          type: "boolean"
          required: true
    `;

    const reqheaders = {
      Accept: "application/vnd.github.raw",
      Authorization: (value: string) => value !== "",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    nock("https://api.github.com", { reqheaders })
      .get(
        "/repos/alphagov/govuk-frontend/contents/src/govuk/components/summary-list/summary-list.yaml"
      )
      .query({ ref: "v4.5.0" })
      .reply(200, mockSchema);

    const response = await fetchPropertySchema("4.5.0", "summary-list");

    expect(response.data).toEqual(mockSchema);
  });
});

describe("fetchTemplateFile", () => {
  it("should return Nunjucks template file when given component name", async () => {
    const mockTemplate = stripIndent`
    {% set id = params.id %}
    {% set headingLevel = params.headingLevel if params.headingLevel else 2 %}
    <div class="govuk-accordion {%- if params.classes %} {{ params.classes }}{% endif -%}" data-module="govuk-accordion" id="{{ id }}"
    </div>
    `;

    const reqheaders = {
      Accept: "application/vnd.github.raw",
      Authorization: (value: string) => value !== "",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    nock("https://api.github.com", { reqheaders })
      .get(
        "/repos/alphagov/govuk-frontend/contents/src/govuk/components/accordion/template.njk"
      )
      .query({ ref: "v4.5.0" })
      .reply(200, mockTemplate);

    const response = await fetchTemplateFile("4.5.0", "accordion");

    expect(response.data).toEqual(mockTemplate);
  });
});

describe("fetchTemplateImport", () => {
  it("should return Nunjucks template file when given relative component import in the same directory", async () => {
    const mockTemplate = stripIndent`
    {% set id = params.id %}
    {% set headingLevel = params.headingLevel if params.headingLevel else 2 %}
    <div class="govuk-accordion {%- if params.classes %} {{ params.classes }}{% endif -%}" data-module="govuk-accordion" id="{{ id }}"
    </div>
    `;

    const reqheaders = {
      Accept: "application/vnd.github.raw",
      Authorization: (value: string) => value !== "",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    nock("https://api.github.com", { reqheaders })
      .get(
        "/repos/alphagov/govuk-frontend/contents/src/govuk/components/accordion/template.njk"
      )
      .query({ ref: "v4.5.0" })
      .reply(200, mockTemplate);

    const response = await fetchTemplateImport(
      "4.5.0",
      "accordion",
      "./template.njk"
    );

    expect(response.data).toEqual(mockTemplate);
  });

  it("should return Nunjucks template file when given relative component import in another component directory", async () => {
    const mockTemplate = stripIndent`
    {% set id = params.id %}
    {% set headingLevel = params.headingLevel if params.headingLevel else 2 %}
    <div class="govuk-accordion {%- if params.classes %} {{ params.classes }}{% endif -%}" data-module="govuk-accordion" id="{{ id }}"
    </div>
    `;

    const reqheaders = {
      Accept: "application/vnd.github.raw",
      Authorization: (value: string) => value !== "",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    nock("https://api.github.com", { reqheaders })
      .get(
        "/repos/alphagov/govuk-frontend/contents/src/govuk/components/textarea/macro.njk"
      )
      .query({ ref: "v4.5.0" })
      .reply(200, mockTemplate);

    const response = await fetchTemplateImport(
      "4.5.0",
      "character-count",
      "../textarea/macro.njk"
    );

    expect(response.data).toEqual(mockTemplate);
  });
});
