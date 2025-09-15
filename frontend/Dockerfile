FROM node:18
WORKDIR /app
COPY package*.json ./
# Use npm install to ensure lockfile stays in sync during builds
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
