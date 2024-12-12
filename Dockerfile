FROM node:22.9.0-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store  pnpm install --frozen-lockfile
COPY . .
RUN pnpm -F admin -F client run build


FROM base as prod
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm -F server install --prod --frozen-lockfile
COPY ./server ./server
COPY ./shared ./shared
COPY --from=build /usr/app/admin/build ./server/static/admin
COPY --from=build /usr/app/client/dist ./server/static/client

HEALTHCHECK CMD node ./server/src/healthcheck.js

CMD ["pnpm", "-F", "server", "run", "start"]
