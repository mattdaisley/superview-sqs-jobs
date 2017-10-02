
const moment  = require('moment'),
      config  = require('../../config'),
      utils   = require('../../utils'),
      DB      = require('../../db'),
      knex    = require('knex')({client: 'mysql'}),

googleYoutubeSubscribe = ( body, done ) => {
  if ( body ) {
    const { lease, topic, hub } = body

    addSubscription( lease, topic, hub )
      .then( () => {
        done();
      })
      .catch( err => {
        console.log(err);
      })
  }

}

addSubscription = ( lease, topic, hub ) => {
  return new Promise( (resolve, reject ) => {

    const subscription_expires = moment(new Date(lease * 1000)).utc().format('YYYY-MM-DD HH:mm:ss');

    DB.connect( connection => {
      connection.query( 'INSERT INTO ' + config.db.tablePrefix + 'google_pubsub_subscriptions ( topic, hub, subscription_expires ) VALUES (?,?,?)', [topic, hub, subscription_expires], (err, response) => {
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

module.exports = googleYoutubeSubscribe;