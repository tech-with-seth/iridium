# Stage 1: install full dependency tree (including dev deps) for the build step
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Stage 2: install only production dependencies for the final runtime image
FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Stage 3: compile the app with the full dependency tree
FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ARG RESEND_API_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY
RUN npx prisma generate --config ./prisma.config.ts --schema=./prisma/schema.prisma
RUN npm run build

# Stage 4: slim runtime image with compiled artifacts and production deps
FROM node:20-alpine
ARG RESEND_API_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/prisma /app/prisma
COPY --from=build-env /app/app/generated /app/app/generated
WORKDIR /app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
