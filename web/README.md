#Challenger webapp

> Scaffolding based on [Ember App Kit](http://iamstef.net/ember-app-kit/).

##Deploying the application

- Copy the generated json files to the `web/dist/assets/json/` directory.
- Copy the `web/dist` directory to your server and open a browser and visit the `index.html`.
- (If you don't plan, on placing the application on the server root, change `index.html` and replace absolute paths with relative paths)

###Developing and building the application

If you want to change something or build everything yourself, you need to follow these steps:

1. clone the repository
2. cd to `web/`
3. run `npm install` (wait until it's finished downloading dependencies)
4a. run `grunt server` to start a development server
4b. run `grunt dist` to build the project (the result is located in `web/dist/`
