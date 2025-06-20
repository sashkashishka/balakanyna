ARG VITE_SENTRY_KEY=123
ARG VITE_CLIENT_VERSION=123
ARG VITE_SENTRY_ORG=org
ARG VITE_SENTRY_PROJECT=proj
ARG VITE_SENTRY_AUTH_TOKEN=token

FROM node:22.9.0-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_INTEGRITY_KEYS=0

RUN corepack enable
WORKDIR /usr/app
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY ./admin/package.json ./admin/
COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

FROM base as build

ARG VITE_SENTRY_KEY
ARG VITE_CLIENT_VERSION
ARG VITE_SENTRY_ORG
ARG VITE_SENTRY_PROJECT
ARG VITE_SENTRY_AUTH_TOKEN

ENV VITE_SENTRY_KEY=$VITE_SENTRY_KEY
ENV VITE_CLIENT_VERSION=$VITE_CLIENT_VERSION
ENV VITE_SENTRY_ORG=$VITE_SENTRY_ORG
ENV VITE_SENTRY_PROJECT=$VITE_SENTRY_PROJECT
ENV VITE_SENTRY_AUTH_TOKEN=$VITE_SENTRY_AUTH_TOKEN

RUN --mount=type=cache,id=pnpm,target=/pnpm/store  pnpm install --frozen-lockfile
COPY . .
RUN pnpm -F server run test
RUN pnpm -F admin -F client run build


FROM base as prod
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm -F server install --prod --frozen-lockfile
COPY ./server ./server
COPY ./shared ./shared
COPY --from=build /usr/app/admin/build ./server/src/static/admin
COPY --from=build /usr/app/client/dist ./server/src/static/client

HEALTHCHECK CMD node ./server/src/healthcheck.js

CMD ["pnpm", "-F", "server", "run", "start"]
