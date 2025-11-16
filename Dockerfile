ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG=C.UTF-8

# Install node and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy add-on files
COPY run.sh /run.sh
COPY server.js /app/server.js
COPY web /app/web

# Build Svelte frontend
RUN cd /app/web \
    && npm install \
    && npm run build

# Backend deps just for serving static files + YAML config
RUN cd /app \
    && npm install express body-parser js-yaml

RUN chmod a+x /run.sh

EXPOSE 8099

CMD [ "/run.sh" ]
