# ---------- Frontend Build ----------
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# copy frontend source
COPY frontend/ ./

# build production files
RUN npm run build

# ---------- Backend Build ----------
FROM node:18 AS backend
WORKDIR /app

# copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# copy backend source
COPY backend/ ./ 

# copy built frontend into backend's public dir
WORKDIR /app/backend
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/dist ./public

# expose backend port
EXPOSE 5000

# start server
CMD ["node", "index.js"]
