#Challenger webapp

> Scaffolding based on [Ember App Kit](http://iamstef.net/ember-app-kit/).

##Setup

Right now (`dev`) the application needs an application and api server.
The application server hosts required css, js and html.
The api server provides json files.

###Dev

####Api server

(The api server is a simple SimpleHTTPServer with Access-Control-Allow-Origin set)

Run in the project root:

```
python2 server-json-provider.py 8080
```

####App server

The app server doesn't care where it's executed. Use a static file hoster and change `dist/assets/*.config.min.js` to point to the api server:

```
window.ENV=window.ENV||{BASE_URL:"http://localhost:8080/"};
```

If you want to help change something, run:

1. `npm install` in the web directory to load all node and bower dependencies.
2. `grunt server` to start an dev server (on port 8000) that watches for changes, reloads the browser and recompiles everytime