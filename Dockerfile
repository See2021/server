FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./public ./public
RUN npx prisma generate
EXPOSE 3000

#looking for mysql is it avaliable, hen run prisma mitgrate 
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]