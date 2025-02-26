FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./

RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine As production
RUN npm install pm2 -g
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/ecosystem.config.js ./ecosystem.config.js 
EXPOSE 3000
# Команда для запуска 
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env=production"]