# govuk-nunjucks-renderer

[![CI](https://github.com/opencastsoftware/govuk-nunjucks-renderer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/opencastsoftware/govuk-nunjucks-renderer/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/opencastsoftware/govuk-nunjucks-renderer/branch/main/graph/badge.svg?token=Gpph41PU7r)](https://codecov.io/gh/opencastsoftware/govuk-nunjucks-renderer)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://spdx.org/licenses/MIT.html)

This repository contains a Node.js web app for rendering [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) Nunjucks templates.

This is to enable comparative testing of GOV.UK Frontend components implemented in other technologies.

## Usage

This project is published to GitHub Packages as a container.

To run it:

```bash
# Docker
docker run -d -p 3000:3000 ghcr.io/opencastsoftware/govuk-nunjucks-renderer:latest
# Podman
podman run -d -p 3000:3000 ghcr.io/opencastsoftware/govuk-nunjucks-renderer:latest
```

When using podman you need to be [logged into](https://docs.podman.io/en/latest/markdown/podman-login.1.html) ghcr.io [using a token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with the ```read:packages``` scope.

## API

The app features only one endpoint:

* **URL**

  `/govuk/:version/components/:name`

* **Method**

  `POST`
  
* **Path Parameters**

  **Required**
  
  `version` - A GOV.UK Frontend [release tag](https://github.com/alphagov/govuk-frontend/releases/) minus the leading `v`.
  
  `name` - The GOV.UK Frontend [component](https://design-system.service.gov.uk/components/) name. The names correspond to the [component folder names](https://github.com/alphagov/govuk-design-system/tree/9ace99c886492c64e5303614d5b4303bd29689b9/src/components) in the GOV.UK Design System repository.

* **Request Body**

  A JSON object corresponding to the parameters of the GOV.UK Design System component.
  
* **Success Response**

  * **Code**: 200
  
    **Body**: A `text/html` response body containing the rendered template content
    
    **Example**:
    
    ```bash
    curl -X POST -H "Accept: text/html" -H "Content-Type: application/json" --data '{"params": {"id": "bla", "items": []}}' http://localhost:3000/govuk/4.5.0/components/accordion/
    ```
    text/html:
    ```html
    <div class="govuk-accordion" data-module="govuk-accordion" id="bla">
  
    </div>
    ```
    
* **Error Responses**

  * **Code**: 406

    **Body**: empty
    
    **Cause**: The requester *must* accept HTML. This is signified by an `Accept` header which contains the content type `text/html`.
    
  * **Code**: 415

    **Body**: empty
   
    **Cause**: The requester *must* provide a JSON POST body. This is signified by a `Content-Type` header which contains the content type `application/json`.
   
  * **Code**: 400

    **Body**: A JSON array describing the errors found when validating the request. See the [zod](https://github.com/colinhacks/zod) documentation, especially [ZodIssue](https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md#zodissue) for an explanation of the format of these errors.
    
    **Cause**:
    Requests are validated using the [zod](https://github.com/colinhacks/zod) validation library, with a schema derived from the component's parameter definitions.
    See e.g. [the definitions for accordion](https://github.com/alphagov/govuk-frontend/blob/73c957917a193c61957e889808cc7ba6de479187/src/govuk/components/accordion/accordion.yaml). 
    Validation will fail when the request does not match these expectations.
   
    **Example**:
    
      ```bash
      curl -X POST -H "Accept: text/html" -H "Content-Type: application/json" --data '{"params": {"items": []}}' http://localhost:3000/govuk/4.5.0/components/accordion/
      ```
      application/json:
      ```json
      [
        {
          "code":"invalid_type",
          "expected":"string",
          "received":"undefined",
          "path":[
            "params",
            "id"
          ],
          "message":"Required"
        }
      ]
      ```
 
## Contributing

This project is built with Typescript and Node.js.

The recommended Node.js version can be found at [.node-version](./.node-version). Many Node version managers recognise this file.

We recommend using a manager like [fnm](https://github.com/Schniz/fnm) to install the appropriate Node.js version to build this project.

To build:

`npm install && npm run build`

To run tests:

`npm run test`

To run the app:

`npm run dev`

## License

All code in this repository is licensed under the MIT License. See [LICENSE](./LICENSE).
