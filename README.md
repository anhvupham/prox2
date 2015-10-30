
# PROX 2
##### Is another version of Prox but built in AngularJS and Sailsjs for one who prefer AngularJS.

## Features
* Edit the shell script right on app.
* Support shortcode which is helpful to run the service with args from the client.
* Live time checking service status.
* Search for a service.

## Upcoming Features
* Generate and run Dockerfile.

## Prerequisites
* [Node.js](http://nodejs.org/) (with NPM)
* [MONGO DB >3.0](http://www.mongodb.org/)

## Installation 
Clone the src
`git clone https://github.com/anhvupham/prox2.git`

## Running Prox2
`cd prox2 && npm start`
Then visit your app at [http://localhost:1337/](http://localhost:1337/).

## Sample of a Node service using shellscript with shortcode
* Name : Node service
* CMD : sh
* ARGS : build.sh, [?not-build:build], [?not-run:run], [?not-push:push] <<-- shortcode
* CWD : /var/www/nodeservice
* STOP CMD : sh build.sh not-build not-run not-push stop
* CHECK CMD : nc -zv localhost 1338 
* PORT : 1338

## Sample of shellscipt for above
```sh
if [ "$1" = "build" ]
then
    echo 'RUN process built'
fi

if [ "$3" = "push" ]
then
    echo 'PUSH process started'
fi

if [ "$2" = "run" ]
then
    node index
fi

if [ "$4" = "stop" ]
then
    fuser -n tcp -k 1337
fi
```

## Useful Links
* [Sailsjs](http://sailsjs.org/) (This is what we built the backend on top of)
* [AngularJS](https://angularjs.org/) (MVC Client Framework)
* [Boot Swatch](http://bootswatch.com/) (A Bootstrap Theming Wrapper)

## GITHUB
* [prox2](https://github.com/anhvupham/prox2) 
