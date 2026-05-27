FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build --workspace=@touchgrass/core
CMD ["node", "packages/core/dist/index.js"]