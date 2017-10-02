
const 
  { googleUserLogin, googleYoutubeFeed, googleYoutubeSubscribe }   = require('./google')


messageHandler = (message, done) => {
  
  try {

    if ( message.MessageAttributes && message.MessageAttributes.type ) {
      const type = message.MessageAttributes.type.StringValue
      const messageBody = JSON.parse(message.Body);
      
      console.log(type);
      switch( type ) {
        case 'GOOGLE_USER_LOGIN':
          googleUserLogin( messageBody, done );
          return;
        case 'GOOGLE_YOUTUBE_FEED':
          googleYoutubeFeed( messageBody, done );
          return;
        case 'GOOGLE_YOUTUBE_SUBSCRIBE':
          googleYoutubeSubscribe( messageBody, done );
          return;
        default:
          console.log('unhandled message: ', message);
          break;
      }
    } else {
      console.log('unhandled message: ', message);
    }
    done();
    
  } catch(err) {
    console.log(err)
    done();
  }

}

module.exports = messageHandler;