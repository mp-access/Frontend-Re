FROM node as frontend
ARG REACT_APP_AUTH_SERVER_URL
ENV REACT_APP_AUTH_SERVER_URL=https://info1-staging.ifi.uzh.ch:8443
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

FROM nginx
WORKDIR /usr/share/nginx/html
COPY --from=frontend /app/build ./
EXPOSE 80 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]