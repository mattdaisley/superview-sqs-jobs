var 
    config          = require('../config'),
    merge           = require('merge'),
    crypto          = require('crypto'),
    algorithm       = 'aes-256-ctr',
    password        = 'randomPasswordString',
    util;


util = {

    merge: merge,
    
    encrypt: function encrypt(text){
        var cipher = crypto.createCipher(algorithm,password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    },
        
    decrypt: function decrypt(text){
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }

};

// make sure all methods can be called by eachother
[
    'encrypt',
    'decrypt'
].forEach( (funcName) => {
    util[funcName] = util[funcName].bind(util);
});

module.exports = util;
