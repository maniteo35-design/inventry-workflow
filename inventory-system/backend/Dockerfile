FROM node:20-alpine
WORKDIR /app
# node-canvas (used for barcode/QR) needs these system libs on Alpine
RUN apk add --no-cache build-base cairo-dev pango-dev giflib-dev
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
