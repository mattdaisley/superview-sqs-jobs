// ## Server Loader
// Passes options through the boot process to get a server instance back
var consumer = require('./consumer');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

function makeApp(options) {
    options = options || {};

    return consumer(options);
}

module.exports = makeApp;
