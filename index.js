// # Node Server Startup
// Orchestrates the startup of the application when run from command line.

var
  coreApp;

// Proceed with startup
coreApp 	= require('./core');


const queueUrl = 'https://sqs.us-east-1.amazonaws.com/970556883193/SuperViewQueue'
console.log('starting app for queue:', queueUrl);

coreApp( {queueUrl} )
  .then( consumerApp => {
    
    consumerApp.on('error', (err) => {
      console.log(err.message);
      done(err)
    });
      
    consumerApp.start();

  }).catch( err => {
    console.log(err);
  });
