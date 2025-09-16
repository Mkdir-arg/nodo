FROM node:18-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar propietario
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "run", "dev"]
