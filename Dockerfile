ARG NODE_IMAGE=node:20

FROM $NODE_IMAGE as node-image

FROM node-image

ARG DEFAULT_NODE_ENV=production
ARG DEFAULT_GENERATE_SOURCEMAP=false
ARG DEFAULT_PUBLIC_URL=http://localhost:8008

ENV PATH=/app/node_modules/.bin:$PATH
ENV REACT_APP_PUBLIC_URL=$DEFAULT_PUBLIC_URL
ENV NODE_ENV=$DEFAULT_NODE_ENV
ENV GENERATE_SOURCEMAP=$DEFAULT_GENERATE_SOURCEMAP
ENV BACKEND_LOG_LEVEL=DEBUG
ENV BACKEND_URL='http://0.0.0.0:8008'
ENV BACKEND_PUBLIC_URL='http://localhost:8008'
ENV BACKEND_INITIAL_USERS=''
ENV BACKEND_JWT_SECRET=''

EXPOSE 8008
EXPOSE 8448

WORKDIR /app
COPY ./package*.json ./
RUN [ "npm", "ci", "--silent", "--also=dev" ]
COPY tsconfig.json ./tsconfig.json
COPY rollup.config.js ./rollup.config.js
COPY babel.config.json ./babel.config.json
COPY src ./src
RUN [ "npm", "run", "build" ]

CMD [ "npm", "-s", "run", "start-prod" ]
