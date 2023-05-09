ARG NODE_VERSION=latest

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ src/
RUN npm ci && npm run build

FROM node:${NODE_VERSION}-alpine
LABEL org.opencontainers.image.source=https://github.com/opencastsoftware/govuk-nunjucks-renderer
LABEL org.opencontainers.image.vendor="Opencast Software Europe Ltd"
LABEL org.opencontainers.image.licenses=MIT
RUN addgroup -S nunjucks-renderer \
    && adduser -S -D -G nunjucks-renderer nunjucks-renderer
USER nunjucks-renderer
WORKDIR /home/nunjucks-renderer/app
COPY --from=build /app/dist ./
EXPOSE 3000
CMD ["node", "index.js"]
