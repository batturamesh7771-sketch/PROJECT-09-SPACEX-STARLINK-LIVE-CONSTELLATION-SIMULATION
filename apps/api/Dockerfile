FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
# Assuming packages are also copied here if needed

RUN pnpm install

COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm build

EXPOSE 4000 4001

CMD ["node", "dist/server.js"]
