FROM node:16 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo "window.env = { VITE_AUTH0_DOMAIN: '${VITE_AUTH0_DOMAIN}', VITE_AUTH0_CLIENT_ID: '${VITE_AUTH0_CLIENT_ID}' };" > /usr/share/nginx/html/config.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
