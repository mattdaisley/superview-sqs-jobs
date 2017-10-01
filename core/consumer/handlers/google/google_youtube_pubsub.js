
const config  = require('../../config'),
      utils   = require('../../utils'),
      DB      = require('../../db'),
      knex    = require('knex')({client: 'mysql'}),

googleYoutubePubsub = ( body, done ) => {

  if ( body && body['yt:videoId'] && body['yt:channelId'] ) {
    const channelId = body['yt:channelId'][0];
    const video = { videoId: body['yt:videoId'][0], videoPublishedAt: body.published[0] }

    addVideo( channelId, video )
      .then( () => {
        done();
      })
      .catch( err => {
        console.log(err);
      })
  }

}

addVideo = ( channelId, video ) => {
  return new Promise( (resolve, reject ) => {
    DB.connect( connection => {
      connection.query( 'INSERT INTO ' + config.db.tablePrefix + 'google_subscriptions_uploads ( google_channel_id, google_video_id, published_at ) VALUES (?,?,?)', [channelId, video.videoId, video.videoPublishedAt], (err, response) => {
        connection.release();
        if ( err ) console.log('google_youtube_pubsub - addVideo error:', err);
        if ( err && err.code !== 'ER_DUP_ENTRY' ) {
          reject( err ); 
          return; 
        }

        resolve( response );
      });
    })
  })
}

module.exports = googleYoutubePubsub;