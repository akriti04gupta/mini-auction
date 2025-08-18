# ==== Frontend Build Stage ====
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==== Backend Stage ====
FROM node:20-alpine AS backend

WORKDIR /app/backend


COPY backend/ ./

COPY package*.json ./
RUN npm install --omit=dev


COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 5000

# Start backend
CMD ["node", "index.js"]
