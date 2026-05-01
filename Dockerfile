FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/cerxos-shell/browser /usr/share/nginx/html

# Replace the dev manifest with the production template
COPY federation.manifest.json.template /usr/share/nginx/html/federation.manifest.json.template
RUN rm /usr/share/nginx/html/federation.manifest.json

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
