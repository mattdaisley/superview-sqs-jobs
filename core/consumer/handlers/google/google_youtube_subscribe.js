
const moment  = require('moment'),
      config  = require('../../../config'),
      utils   = require('../../../utils'),
      DB      = require('../../../db'),
      knex    = require('knex')({client: 'mysql'}),

googleYoutubeSubscribe = ( body, done ) => {
  if ( body ) {
    const { lease, topic, hub } = body

    checkSubscriptionExists( topic, hub )
      .then( subscriptionExists => {
        console.log('pubsubhubbub subscription', topic, hub, 'isNew', subscriptionExists.length === 0)
        if ( subscriptionExists.length > 0 ) {
          return updateSubscription(lease, topic, hub)
        } else {
          return addSubscription(lease, topic, hub)
        }
      })
      .then( () => {
        done();
      })
      .catch( err => {
        console.log(err);
      })
  }

}

checkSubscriptionExists = ( topic, hub ) => {
  return new Promise( (resolve, reject) => {
    DB.connect( connection => {
        var query = knex(config.db.tablePrefix + 'google_pubsub_subscriptions')
            .select('topic')
            .where( {'topic': topic, 'hub': hub} );

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

addSubscription = ( lease, topic, hub ) => {
  return new Promise( (resolve, reject ) => {

    const subscription_expires = moment(new Date(lease * 1000)).utc().format('YYYY-MM-DD HH:mm:ss');

    DB.connect( connection => {
      
    var query = knex(config.db.tablePrefix + 'google_pubsub_subscriptions')
        .insert({
          'topic': topic, 
          'hub': hub, 
          'subscription_expires': subscription_expires
        })
      // connection.query( 'INSERT INTO ' + config.db.tablePrefix + 'google_pubsub_subscriptions ( topic, hub, subscription_expires ) VALUES (?,?,?)', [topic, hub, subscription_expires], (err, response) => {
    connection.query( query.toString(), (err, response) => {
        connection.release();
        if ( err ) console.log('google_youtube_subscribe - addSubscription error:', err);
        if ( err && err.code !== 'ER_DUP_ENTRY' ) {
          reject( err ); 
          return; 
        }

        resolve( response );
      });
    })
  })
}

updateSubscription = ( lease, topic, hub ) => {
  return new Promise( (resolve, reject ) => {
    
    const subscription_expires = moment(new Date(lease * 1000)).utc().format('YYYY-MM-DD HH:mm:ss');

    DB.connect( connection => {
      
      var query = knex(config.db.tablePrefix + 'google_pubsub_subscriptions')
        .where({'topic': topic, 'hub': hub})
        .update({
          'topic': topic,
          'hub': hub,
          'subscription_expires': subscription_expires,
        })
      
      connection.query( query.toString(), (err, response) => {
        connection.release();
        if ( err ) console.log('google_youtube_pubsub - updateSubscription error:', err);
        if ( err && err.code !== 'ER_DUP_ENTRY' ) {
          reject( err ); 
          return; 
        }

        resolve( response );
      });
    })
  })
}

module.exports = googleYoutubeSubscribe;