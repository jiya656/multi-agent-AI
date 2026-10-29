FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]