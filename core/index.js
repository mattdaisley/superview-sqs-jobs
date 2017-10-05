var consumer = require('./consumer');
var cronjobs = require('./cronjobs');

// Set the default environment to be `dev`
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

function makeApp(options) {

    return new Promise( resolve => {
        consumerOptions = options.consumer || {};
        resolve({ 
            consumer: consumer(consumerOptions),
            cronjobs: cronjobs(),
        })
    })
}

module.exports = makeApp;