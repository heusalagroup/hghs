# @heusalagroup/hghs

*HG HomeServer* will be a zero dep Matrix.org HomeServer written in pure TypeScript.

It can be compiled as a single JS file. The only runtime dependency is NodeJS.

However, it will only support(*) [a subset of Matrix.org protocol](https://github.com/heusalagroup/hghs/issues/16) that our software is using.

*) Except if somebody sponsors our development financially.

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
