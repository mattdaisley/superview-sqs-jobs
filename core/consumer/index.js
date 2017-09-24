
const Consumer       = require('sqs-consumer'),
      path           = require('path'),
      AWS            = require('aws-sdk'),
      config         = require('./config'),
      messageHandler = require('./handlers'),
      credentials    = new AWS.SharedIniFileCredentials();
      

// AWS.config.credentials = credentials;
// AWS.config.update(config.aws);
AWS.config.loadFromPath( path.join(__dirname, 'config', 'aws.json') );

function init(options) {

  return new Promise( resolve => {

    var consumerApp = Consumer.create({
      queueUrl: options.queueUrl,
      messageAttributeNames: ['All'],
      handleMessage: (message, done) => messageHandler(message,done),
      sqs: new AWS.SQS()
    });
    
    resolve(consumerApp);
  });
}

module.exports = init;
