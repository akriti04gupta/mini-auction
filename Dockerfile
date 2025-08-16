# ==== Base image for Node ====
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ==== Backend build ====
FROM base AS build-backend
WORKDIR /app
COPY package*.json ./          # Use root package.json
RUN npm install --omit=dev
COPY backend/ ./backend        # Copy backend code

# ==== Frontend build ====
FROM base AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==== Final image ====
FROM node:20-alpine AS final
WORKDIR /app
COPY --from=build-backend /app/backend ./backend
COPY --from=build-frontend /app/frontend/build ./frontend/build

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 5000
CMD ["node", "index.js"]  # ya tumhare backend entry point ke hisaab se change karo
