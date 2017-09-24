var 
	mysql  = require("mysql"),
	config = require("../config"),
	DB     = {};

var pool  = mysql.createPool({
  	host     : config.db.host,
  	user     : config.db.user,
  	password : config.db.password,
  	database : config.db.database
});

DB.connect = next => {
	
	pool.getConnection( (err, connection) => {
		next(connection);
	});
	
}

module.exports = DB;
