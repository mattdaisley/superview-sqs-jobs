
const config  = require('../../../config'),
      utils   = require('../../../utils'),
      DB      = require('../../../db'),
      knex    = require('knex')({client: 'mysql'}),

googleYoutubeFeed = ( body, done ) => {

  if ( body && body['yt:videoId'] && body['yt:channelId'] ) {
    const channelId = body['yt:channelId'][0];
    const video = { videoId: body['yt:videoId'][0], videoPublishedAt: body.published[0] }

    checkVideoExists( channelId, video.videoId )
      .then( ( existingVideo ) => {
        console.log('Processed video', video.videoId, 'isNew', existingVideo.length === 0)
        if ( existingVideo.length > 0 ) {
          return updateVideo( channelId, video )
        } else {
          return addVideo( channelId, video )
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

checkVideoExists = ( google_channel_id, google_video_id ) => {
  return new Promise( (resolve, reject) => {
      DB.connect( connection => {
          var query = knex(config.db.tablePrefix + 'google_subscriptions_uploads')
              .select('google_channel_id')
              .where( {'google_video_id': google_video_id} );

          connection.query( query.toString(), (err, video) => {
              connection.release();
              if ( err ) { 
                console.log('checkVideoExists error', err)
                reject(err); 
                return; 
              }
              resolve(video);
          });

      });
  });
}

addVideo = ( channelId, video ) => {
  return new Promise( (resolve, reject ) => {
    DB.connect( connection => {

      var query = knex(config.db.tablePrefix + 'google_subscriptions_uploads')
          .insert({
            'google_channel_id': channelId, 
            'google_video_id': video.videoId, 
            'published_at': video.videoPublishedAt
          })

      connection.query( query.toString(), (err, response) => {
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

updateVideo = ( channelId, video ) => {
  return new Promise( (resolve, reject ) => {
    DB.connect( connection => {
      
      var query = knex(config.db.tablePrefix + 'google_subscriptions_uploads')
        .where('google_video_id', video.videoId)
        .update({
          'google_channel_id': channelId,
          'google_video_id': video.videoId,
          'published_at': video.videoPublishedAt,
        })
      
      connection.query( query.toString(), (err, response) => {
        connection.release();
        if ( err ) console.log('google_youtube_pubsub - updateVideo error:', err);
        if ( err && err.code !== 'ER_DUP_ENTRY' ) {
          reject( err ); 
          return; 
        }

        resolve( response );
      });
    })
  })
}

module.exports = googleYoutubeFeed;