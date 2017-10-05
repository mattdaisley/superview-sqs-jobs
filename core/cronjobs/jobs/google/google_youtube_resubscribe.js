
const moment       = require('moment'),
      pubSubHubbub = require("pubsubhubbub"),
      config       = require('../../../config'),
      utils        = require('../../../utils'),
      DB           = require('../../../db'),
      knex         = require('knex')({client: 'mysql'})



const pubsub = pubSubHubbub.createServer({
  callbackUrl: "https://pubsubhub.superview.tv",
  secret: "MyTopSecret"
});

googleYoutubeResubscribe = ( ) => {

  checkExpiringSubscriptions()
    .then( results => {
      let resubPromises = results.map( ({topic, hub}) => {
        return subscribeToPubsubhub( topic, hub )
      })
    })
    .then( () => {
      // done
    })
    .catch( err => {
      console.log(err);
    })

}

checkExpiringSubscriptions = () => {
  return new Promise( (resolve, reject) => {
    DB.connect( connection => {
      const now = new Date().getTime();
      const expireWindow = moment(now).add(6, 'hours').utc().format('YYYY-MM-DD HH:mm:ss');

      var query = knex(config.db.tablePrefix + 'google_pubsub_subscriptions')
          .select('topic', 'hub')
          .where( 'subscription_expires', '<', expireWindow );

      connection.query( query.toString(), (err, result) => {
          connection.release();
          if ( err ) { 
            console.log('checkSubscriptionExists error', err)
            reject(err); 
            return; 
          }
          resolve(result);
      });

    });
  });
}

subscribeToPubsubhub = ( topic, hub ) => {
  return new Promise( (resolve, reject) => {
    console.log('CRON resubbing topic', topic, 'to hub', hub);
    pubsub.subscribe(topic, hub);
    resolve();
  })
}

module.exports = googleYoutubeResubscribe;