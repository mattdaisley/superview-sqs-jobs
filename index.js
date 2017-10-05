// # Node Server Startup
// Orchestrates the startup of the application when run from command line.

var
  coreApp;

// Proceed with startup
coreApp 	= require('./core');

const queueUrl = 'https://sqs.us-east-1.amazonaws.com/970556883193/SuperViewQueue'

coreApp( { consumer: { queueUrl } } )
  .then( apps => {
    
    apps.consumer.then( consumerApp => {
      consumerApp.on('error', (err) => console.log(err.message) );

      console.log('starting app for queue:', queueUrl);
      consumerApp.start();
    })

    apps.cronjobs.then( cronjobsApp => {
      cronjobsApp.start()
    })

  }).catch( err => {
    console.log(err);
  });
