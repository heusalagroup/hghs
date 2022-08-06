# @heusalagroup/hghs

*HG HomeServer* will be a zero dep [Matrix.org](https://matrix.org) HomeServer 
written in pure TypeScript.

It's intended for special use cases when Matrix protocol is used as a backbone 
for custom apps. For example, we use our 
[MatrixCrudRepository](https://github.com/heusalagroup/fi.hg.matrix/blob/main/MatrixCrudRepository.ts) 
as a persistent data store for our software. It's lightweight, minimal and for the moment isn't even planned to 
support full Matrix spec. We might make `hghs` run on browser later; the client already does.

It compiles as a single standalone JavaScript file. The only runtime dependency 
is NodeJS. 

Our software is designed for scalable and fully managed serverless cloud 
environments, e.g. where the software must spin up fast, can run concurrently, 
and can be deployed without a downtime.

Another intended use case for `hghs` is embedded devices (e.g. OpenWRT), for 
example.

It will only support [a subset of Matrix.org protocol](https://github.com/heusalagroup/hghs/issues/16) 
that our software is using. However, we're happy to add more features for 
commercial clients. 

### Test driven development

See [@heusalagroup/hshs-test](https://github.com/heusalagroup/hghs-test) for our 
system tests.

### Fetching source code

```bash
git clone git@github.com:heusalagroup/hghs.git hghs
cd hghs
git submodule update --init --recursive
```

### Build docker containers

This is the easiest way to use the backend.

```
docker-compose build
```

### Start Docker environment

```
export BACKEND_JWT_SECRET='secretJwtString123'
export BACKEND_INITIAL_USERS='app:p4sSw0rd123'
docker-compose up
```

Once running, services will be available:

 * http://localhost:8008 -- `hghs` Matrix.org Server

### Start the server in development mode

FIXME: This isn't working right now. Use production mode.

```
npm start
```

### Build the server

```
npm run build
```

### Start the server in production mode

```
npm run start-prod
```

...and use `http://0.0.0.0:8008`
