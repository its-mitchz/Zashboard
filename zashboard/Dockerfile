ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG=C.UTF-8

# Install node and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy add-on files
COPY run.sh /run.sh
COPY package.json tsconfig.server.json server.ts /app/
COPY web /app/web

# Build Svelte frontend
RUN cd /app/web \
    && npm install \
    && npm run build

# Install backend deps and compile TypeScript server
RUN cd /app \
    && npm install \
    && npm run build

RUN chmod a+x /run.sh

EXPOSE 8099

CMD [ "/run.sh" ]
