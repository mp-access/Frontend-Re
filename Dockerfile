FROM node as frontend
ENV REACT_APP_AUTH_SERVER_URL=${AUTH_SERVER_URL}
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

FROM nginx
WORKDIR /usr/share/nginx/html
COPY --from=frontend /app/build ./
EXPOSE 80 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]