
const google  = require('googleapis'),
      config  = require('../../config'),
      utils   = require('../../utils'),
      DB      = require('../../db'),
      knex    = require('knex')({client: 'mysql'}),
      OAuth2  = google.auth.OAuth2,
      YouTube = google.youtube('v3');

const oauth2Client = new OAuth2(
    config.google.clientId,
    config.google.secret,
    config.appUrl + '/oauth2/google/oauth2callback'
);

const MAX_RESULTS = 50;

googleUserLogin = ( body, done ) => {

  const tokens = JSON.parse(utils.decrypt(body.encryptedToken));
  oauth2Client.setCredentials( tokens );

  const google_user_id = body.google_user_id;
  console.log('GOOGLE_USER_LOGIN by google_user_id:', body.google_user_id)

  try {
    getSubscriptions()
      .then( newSubscriptions => {
        console.log('newSubscriptions count:', newSubscriptions.length );
        let addSubscriptionsPromises = newSubscriptions.map( subscription => addUserSubscriptions(google_user_id, subscription))
        return Promise.all(addSubscriptionsPromises);
      })
      .then( finalSubsriptions => {
        console.log('finalSubsriptions count:', finalSubsriptions.length );
        let playlistRequests = finalSubsriptions.map( subscription => getPlaylists( subscription ) )
        return Promise.all(playlistRequests)
      })
      .then( arrUploadsPlaylists => {
        console.log('arrUploadsPlaylists count:', arrUploadsPlaylists.length );
        let playlistItemsRequests = arrUploadsPlaylists.map( playlist => getPlaylistItems( playlist[0] ) )
        return Promise.all(playlistItemsRequests)
      })
      .then ( arrPlaylistItems => {
        console.log('arrPlaylistItems count:', arrPlaylistItems.length );
        let saveVideoPromises = arrPlaylistItems.map( item => saveVideos( item ) )
        return Promise.all(saveVideoPromises)
        // done();
      })
      .then ( () => {
        done();
      })
      .catch( err => {
        console.log(err);
        done();
      })
  } catch( err ) {
    throw new Error(err);
  }
}

getSubscriptions = ( nextPage ) => {
  
  return new Promise( (resolve, reject) => {


    let options = {
      mine: true,
      part: 'snippet',
      maxResults: MAX_RESULTS,
      auth: oauth2Client
    }
    if ( nextPage ) options.pageToken = nextPage;

    YouTube.subscriptions.list(options, (err, response) => {
      // console.log(err, response.nextPageToken, response.items.length);
      if ( !err ) {
        if ( response.pageInfo.totalResults > 0 ) {
          
          let subscriptions = response.items.map( item => item.snippet.resourceId.channelId)

          if ( response.nextPageToken ) {
            getSubscriptions(response.nextPageToken)
              .then( result => {
                resolve( [ ...subscriptions, ...result ] );
              })
          } else {
            getExistingSubscriptions( subscriptions )
              .then( existingSubscriptions => {
                console.log(existingSubscriptions);
                let newSubscriptions = subscriptions.filter( subscription => {
                  console.log(subscription, existingSubscriptions.indexOf(subscription));
                  return (existingSubscriptions.indexOf(subscription) < 0)
                })
                resolve(newSubscriptions)
              })
          }
        }
      } else {
        reject(err);
      }
    })

  })
}


getPlaylists = ( channelId, nextPage ) => {
  
  return new Promise( (resolve, reject) => {

    let options = {
      id: channelId,
      part: 'snippet, contentDetails',
      maxResults: MAX_RESULTS,
      auth: oauth2Client
    }
    if ( nextPage ) options.pageToken = nextPage;

    YouTube.channels.list(options, (err, response) => {
      if ( !err ) {
        // console.log('YouTube.channels.list response: ', response, response.items[0].contentDetails.relatedPlaylists);
        if ( response.pageInfo.totalResults > 0 ) {
          
            let uploadsPlaylists = response.items.map( item => ({ channelId: channelId, uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads }) )

          if ( response.nextPageToken ) {
            getPlaylists(channelId, response.nextPageToken)
              .then( result => {
                resolve( [ ...uploadsPlaylists, ...result ] );
              })
          } else {
            resolve( uploadsPlaylists );
          }
        }
      } else {
        console.log('getPlaylists error');
        reject(err);
      }
    })

  })
}

getPlaylistItems = ( { channelId, uploadsPlaylistId } ) => {
  // console.log(channelId, uploadsPlaylistId);
  return new Promise( (resolve, reject) => {
    
    let options = {
      playlistId: uploadsPlaylistId,
      part: 'snippet,contentDetails',
      maxResults: 10,
      auth: oauth2Client
    }

    YouTube.playlistItems.list(options, (err, response) => {
      if ( !err ) {
        // console.log('YouTube.playlistItems.list response: ', response, response.items);
        if ( response.pageInfo.totalResults > 0 ) {
          
          let videos = response.items.map( video => {
            // console.log(video);
            if ( video.kind === 'youtube#playlistItem' ) {
              return { videoId: video.contentDetails.videoId, videoPublishedAt: video.snippet.publishedAt }
            } else {
              return undefined;
            }
          })

          resolve( { channelId: channelId, uploadsPlaylistId: uploadsPlaylistId, videos: videos } );
        } else {
          resolve( { channelId: channelId, uploadsPlaylistId: uploadsPlaylistId, videos: [] } )
        }
      } else {
        console.log(err);
        reject(err);
      }
    })

  })
}

saveVideos = ( { channelId, videos } ) => {

  return new Promise( (resolve, reject) => {
    
    let addVideosPromises = videos.map( video => addVideo(channelId, video) )
    Promise.all(addVideosPromises)
      .then( () => {
        resolve();
      })
      .catch( err => { console.log(err); reject(err); } )

  })
}

getExistingSubscriptions = ( subscriptions ) => {
  return new Promise( (resolve, reject) => {
      DB.connect( connection => {
          var query = knex(config.db.tablePrefix + 'google_users_subscriptions')
              .select('google_channel_id')
              .whereIn('google_channel_id', subscriptions);

          connection.query( query.toString(), (err, subscriptions) => {
              connection.release();
              if ( err ) { reject(err); return; }

              resolve(subscriptions.map( row => row.google_channel_id ));
          });

      });
  });
}

addUserSubscriptions = ( google_user_id, channelId ) => {
  return new Promise( (resolve, reject ) => {
    DB.connect( connection => {
      connection.query( 'INSERT INTO ' + config.db.tablePrefix + 'google_users_subscriptions ( google_user_id, google_channel_id ) VALUES (?,?)', [google_user_id, channelId], (err, response) => {
        connection.release();
        // console.log(err);
        if ( err ) { reject(err); return; }

        resolve( channelId );
      });
    })
  })
}


addVideo = ( channelId, video ) => {
  return new Promise( (resolve, reject ) => {
    DB.connect( connection => {
      connection.query( 'INSERT INTO ' + config.db.tablePrefix + 'google_subscriptions_uploads ( google_channel_id, google_video_id, published_at ) VALUES (?,?,?)', [channelId, video.videoId, video.videoPublishedAt], (err, response) => {
        connection.release();
        // console.log(err);
        if ( err ) { reject(err); return; }

        resolve( response );
      });
    })
  })
}

module.exports = googleUserLogin;