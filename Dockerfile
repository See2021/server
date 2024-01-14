FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./public ./public
RUN npx prisma generate
EXPOSE 3000
CMD npm start