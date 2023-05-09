import nunjucks, { ILoader, Loader } from "nunjucks";
import { fetchTemplateFile, fetchTemplateImport } from "./github";
import fs from "fs/promises";
import path from "path";
import logger from "./logger";

const REPO_NAME = "alphagov/govuk-frontend";
const COMPONENTS_PATH = "src/govuk/components";
const BASE_PATH = `/repos/${REPO_NAME}/contents/${COMPONENTS_PATH}`;

export class GitHubLoader extends Loader implements ILoader {
  async = true;
  versionDir: string;
  componentDir: string;
  version: string;
  component: string;

  constructor(tmpDir: string, version: string, component: string) {
    super();
    this.versionDir = path.join(tmpDir, version);
    this.componentDir = path.join(this.versionDir, BASE_PATH, component);
    this.version = version;
    this.component = component;
  }

  async writeTemplateFile(templatePath: string, templateData: string) {
    await fs.mkdir(path.dirname(templatePath), { recursive: true });
    await fs.writeFile(templatePath, templateData, { encoding: "utf-8" });
  }

  async requestTemplateFile(name: string) {
    if (name === this.component) {
      // We're rendering a top-level component template
      return await fetchTemplateFile(this.version, name);
    } else if (name.indexOf(this.versionDir) === 0) {
      // We're fetching a template relative to our temporary directory
      const relative = path.relative(this.componentDir, name);
      return await fetchTemplateImport(this.version, this.component, relative);
    } else {
      // We're fetching a template relative to another template
      return await fetchTemplateImport(this.version, this.component, name);
    }
  }

  resolveTemplatePath(name: string) {
    if (name === this.component) {
      // We're rendering a top-level component template
      return path.join(this.versionDir, BASE_PATH, name, "template.njk");
    } else if (name.indexOf(this.versionDir) === 0) {
      // We're fetching a template relative to our temporary directory
      return name;
    } else {
      // We're fetching a template relative to another template
      return path.join(this.componentDir, name);
    }
  }

  // The Nunjucks type definitions don't work with their custom object system.
  // They make it impossible to extend Loader without reimplementing all of its methods.
  // We can't implement the non-callback based getSource because it must be synchronous.
  // @ts-ignore
  getSource(
    name: string,
    callback: nunjucks.Callback<Error, nunjucks.LoaderSource>
  ): void {
    const requestTemplate = this.requestTemplateFile(name);
    const templatePath = this.resolveTemplatePath(name);
    logger.info(`Resolved effective template path to ${templatePath}`);

    requestTemplate
      .then(async (response) => {
        await this.writeTemplateFile(templatePath, response.data);
        callback(null, {
          src: response.data,
          path: templatePath,
          noCache: false,
        });
      })
      .catch((err) => {
        callback(err, null);
      });
  }
}
