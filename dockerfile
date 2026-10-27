FROM node:20

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
