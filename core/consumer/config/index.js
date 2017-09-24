var path      = require('path'),
	config 			= {};

config.web = {};
config.db  = {};

config.appRoot      = path.resolve(__dirname, '../../../');
config.corePath     = path.resolve(config.appRoot + '/core');

config.apiBaseUri   = '/api/v0.1/';

config.jwtSecret    = 'NodeServerStarterSecret';

config.twitchClientId = '0ajwj4yx39smt1qtzfhrgjihvuo1wr';
config.twitchSecret = 'oygk91c2god1poqbjrsm450chfpf21';

process.env.TZ = 'UTC';

config.aws = {region: 'us-east-1'}

config.google = {
	clientId: '218826255982-a228pql1h0cjcdve6mal0on2ipveu99u.apps.googleusercontent.com',
	secret: 'pPSHDRlWMsciRzJGpQu4VZ-h'
}

switch ( process.env.NODE_ENV ) {
	// dev overrides for configuration values
	case 'dev':

		config.web.host = '127.0.0.1';
		config.web.port = 3000;

		config.db.host = "useast-mysql-test.cjxfiley5kef.us-east-1.rds.amazonaws.com";
		config.db.user = "mattdaisleyadm";
		config.db.password = "ADM.Bodyeye803290.DB";
		config.db.database = "mdaisleydata";
		config.db.tablePrefix = "sv_";

		config.webAppUrl = 'http://127.0.0.1:7768';
		config.appUrl = 'http://' + config.web.host + ':' + config.web.port;
		
		config.twitchClientId = 'yvzceoimk2ihz6zcq83b6zts3b7mdq';
		config.twitchSecret = '3bdmaq43zp87pylwwne2j94rkcbnkv';

		break;
	default:

		config.web.host = '127.0.0.1';
		config.web.port = 3000;

		config.db.host = "useast-mysql-test.cjxfiley5kef.us-east-1.rds.amazonaws.com";
		config.db.user = "mattdaisleyadm";
		config.db.password = "ADM.Bodyeye803290.DB";
		config.db.database = "mdaisleydata";
		config.db.tablePrefix = "sv_";

		config.webAppUrl = 'https://www.superview.tv';
		config.appUrl = 'https://auth.superview.tv';
		
		config.twitchClientId = '0ajwj4yx39smt1qtzfhrgjihvuo1wr';
		config.twitchSecret = 'oygk91c2god1poqbjrsm450chfpf21';

		break;
}

module.exports = config;
