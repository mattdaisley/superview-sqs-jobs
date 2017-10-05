
const cron      = require('node-cron'),
      config    = require('../config'),
      jobs      = require('./jobs')
      

function init(options) {

  return new Promise( resolve => {

    var task = cron.schedule('*/30 * * * *', jobs.googleYoutubeResubscribe, false);
    resolve(task);
    
  });
}

module.exports = init;
