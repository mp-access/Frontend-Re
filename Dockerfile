FROM node as frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx
WORKDIR /usr/share/nginx/html
COPY --from=frontend /app/build ./
EXPOSE 80
ARG ENABLED_MODULES=nginx-http-shibboleth
ENTRYPOINT ["nginx", "-g", "daemon off;"]