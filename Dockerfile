# ==== Backend ====
WORKDIR /app/backend
COPY backend/ ./         # Copy all backend code
RUN npm install --prefix .   # if backend has its own package.json; otherwise skip install

# ==== Frontend ====
WORKDIR /app/frontend
COPY frontend/package*.json ./   # Copy frontend package.json
RUN npm install                  # Install frontend deps
COPY frontend/ ./                # Copy all frontend code
RUN npm run build                # Build React app
