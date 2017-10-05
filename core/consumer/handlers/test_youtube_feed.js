
const { googleYoutubeFeed }   = require('./google')

const body = {
  'yt:videoId': ['NULzR_r5LiMaaa'],
  'yt:channelId': ['UC0tb_aXQF1DIH-0il0nk0Uw'],
  'published': ['2017-10-04T16:00:02+00:00'],
}

googleYoutubeFeed(body, () => console.log('done') )
