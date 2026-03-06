FROM oven/bun:1-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bunx --bun prisma generate && bun run build

FROM node:20-alpine
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=development-dependencies-env /app/node_modules/prisma /app/node_modules/prisma
COPY --from=development-dependencies-env /app/node_modules/@prisma/engines /app/node_modules/@prisma/engines
COPY --from=build-env /app/build /app/build
COPY ./prisma /app/prisma
COPY ./prisma.config.ts /app/prisma.config.ts
WORKDIR /app
CMD ["npm", "run", "start"]
