FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS production
RUN npm install pm2 -g
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/ecosystem.config.js ./ecosystem.config.js 
EXPOSE 3000
# Команда для запуска 
CMD ["pm2-runtime", "start", "ecosystem.config.js"]