FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ARG POSTHOG_API_KEY
ARG POSTHOG_HOST
ENV POSTHOG_API_KEY=$POSTHOG_API_KEY \
    POSTHOG_HOST=$POSTHOG_HOST \
    VITE_POSTHOG_API_KEY=$POSTHOG_API_KEY \
    VITE_POSTHOG_HOST=$POSTHOG_HOST
RUN rm -f prisma.config.ts
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM node:20-alpine
ARG POSTHOG_API_KEY
ARG POSTHOG_HOST
ENV POSTHOG_API_KEY=$POSTHOG_API_KEY \
    POSTHOG_HOST=$POSTHOG_HOST
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/prisma /app/prisma
COPY --from=build-env /app/app/generated /app/app/generated
WORKDIR /app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
