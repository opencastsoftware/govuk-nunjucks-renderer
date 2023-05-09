import axios from "axios";
import logger from "./logger";

const GITHUB_TOKEN = process.env["GITHUB_TOKEN"];
const GITHUB_API_BASE_URL = "https://api.github.com";
const REPO_NAME = "alphagov/govuk-frontend";
const COMPONENTS_PATH = "src/govuk/components";
const BASE_PATH = `/repos/${REPO_NAME}/contents/${COMPONENTS_PATH}`;

const githubApi = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: {
    Accept: "application/vnd.github.raw",
    Authorization: GITHUB_TOKEN || "",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

export const fetchPropertySchema = async (version: string, name: string) => {
  const propSchema = `${name}/${name}.yaml`;
  const requestPath = `${BASE_PATH}/${propSchema}`;
  logger.info(`Fetching ${requestPath}`);
  return await githubApi.get(requestPath, {
    params: {
      ref: `v${version}`,
    },
  });
};

export const fetchTemplateFile = async (version: string, name: string) => {
  const templatePath = `${name}/template.njk`;
  const requestPath = `${BASE_PATH}/${templatePath}`
  logger.info(`Fetching ${requestPath}`);
  return await githubApi.get(requestPath, {
    params: {
      ref: `v${version}`,
    },
  });
};

export const fetchTemplateImport = async (version: string, template: string, importPath: string) => {
  const requestPath = `${BASE_PATH}/${template}/${importPath}`
  logger.info(`Fetching ${requestPath}`);
  return await githubApi.get(requestPath, {
    params: {
      ref: `v${version}`,
    },
  });
};
