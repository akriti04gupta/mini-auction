FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build


# Backend
FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install --production

COPY backend/ ./

# Frontend and Backend
COPY --from=builder /app/frontend/build /app/backend/public

EXPOSE 5000

CMD ["node", "index.js"]
