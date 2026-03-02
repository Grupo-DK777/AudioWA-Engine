# Usar imagen base de node (Debian para mejor compatibilidad de binarios)
FROM node:20

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite (default 5173)
EXPOSE 5173

# Comando para desarrollo
# Forzamos reinstalación de bindings específicos si fallan, o simplemente corremos dev
CMD ["npm", "run", "dev", "--", "--host"]
