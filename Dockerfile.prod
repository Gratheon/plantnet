FROM node:16-alpine

WORKDIR /app
COPY . /app/

RUN npm install

EXPOSE 4000

CMD ["node", "app/plantnet.js"]
