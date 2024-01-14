FROM node:18.18-alpine3.18

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm cache clean --force

EXPOSE 4800

CMD ["npm", "run", "prod"]
