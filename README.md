# @heusalagroup/hghs

*HG HomeServer* will be a zero dep [Matrix.org](https://matrix.org) HomeServer 
written in pure TypeScript.

It compiles as a single standalone JavaScript file. The only runtime dependency 
is NodeJS. We plan to support embedded devices (e.g. OpenWRT), for example.

It will only support [a subset of Matrix.org protocol](https://github.com/heusalagroup/hghs/issues/16) that our 
software is using. However, we're happy to add more features for commercial 
clients. 

### Test driven development

See [@heusalagroup/hshs-test](https://github.com/heusalagroup/hghs-test) for our 
system tests.

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

...and open http://0.0.0.0:3000
