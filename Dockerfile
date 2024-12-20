FROM node:16 AS build

ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID

ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN echo "VITE_AUTH0_DOMAIN: $VITE_AUTH0_DOMAIN"
RUN echo "VITE_AUTH0_CLIENT_ID: $VITE_AUTH0_CLIENT_ID"


RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

