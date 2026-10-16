FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM dependencies AS build

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json tsconfig.build.json ./
RUN npm run prisma:generate

COPY nest-cli.json ./
COPY src ./src
RUN npm run build


FROM dependencies AS migrations

ENV NODE_ENV=production

COPY prisma ./prisma
COPY prisma.config.ts ./

CMD ["npm", "run", "prisma:migrate:deploy"]


FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000

USER node

CMD ["npm", "run", "start:prod"]
