FROM mcr.microsoft.com/devcontainers/javascript-node:20

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code (node_modules excluded by .dockerignore)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
