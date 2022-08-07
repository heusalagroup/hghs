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

#### Fetching source code using SSH

```shell
git clone git@github.com:heusalagroup/hghs.git hghs
cd hghs
git submodule update --init --recursive
```

#### Fetching source code using HTTP

Our code leans heavily on git submodules configured over ssh URLs. For http 
access, you'll need to set up an override to use https instead:

```shell
git config --global url.https://github.com/heusalagroup/.insteadOf git@github.com:heusalagroup/
```

This will translate any use of `git@github.com:heusalagroup/REPO` to 
`https://github.com/heusalagroup/REPO`.

This setting can be removed using:

```shell
git config --unset --global url.https://github.com/heusalagroup/.insteadOf
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
