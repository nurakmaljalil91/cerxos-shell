#!/bin/sh
set -e

envsubst < /usr/share/nginx/html/federation.manifest.json.template \
         > /usr/share/nginx/html/federation.manifest.json

exec nginx -g 'daemon off;'
