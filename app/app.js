#!/usr/bin/env node
var  path = require('path')
    ,favicon = require('serve-favicon')
    , logger = require('morgan')
    , servestatic   = require('serve-static')
    , cors         = require('cors')
    ,scomm         = require('../lib/self-comm')
    ,mcomm         = require('../lib/mid-comm')

var defaultPlugs=undefined;// ['demo']
function initServer(setting){
    var routers=scomm.routers(scomm.$include(path.resolve(__dirname),defaultPlugs));
    var redisStore=scomm.redisStore(setting.session.redis);
    var options2 ={
        secret:"I'm wangmin" ,
        sidkey:'connect.sid',
        fieldkey:'session',
        fielduser:'user',
        EXPIRES:30* 24 * 60* 60 * 1000,
        PREFIX:'sess:',
        PREFIX_AUTH:'auth:',
        ONEDAY: 24 * 60* 60,
        store:redisStore
    };


    var app = mcomm.express()
        .set('views', path.join(__dirname, 'views'))
        .set('view engine', 'ejs')
        .use(logger('dev'))
        .use(servestatic('public',{redirect:false}))
        .use(favicon( 'public/favicon.ico'))
        .use(cors())
        .use(scomm.logger.use())
        .use(scomm.session(options2))
        .use(routers);


    //for test
    var testdata= require( path.resolve('userdata.json'));
    app.use('/testdata',function(req, res, next) {
        res.json(testdata);
    });
    app.use('/frameInfo',function(req, res, next) {
        res.json(testdata);
    });
    app.use('/userMenus',function(req, res, next) {
        res.json(testdata.userMenus);
    });
    app.use('/routePages',function(req, res, next) {
        res.json(testdata.routePages);
    });
    return app;
}

if (require.main === module) {
    var settting= require(path.resolve('setting.json'))
    var app = initServer(settting);
    app.set('port',settting.server.port);
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port ' + server.address().port);
    });
}
exports = module.exports =initServer;

/*
var redisvalid=require('../lib/redis/matrix').valid
var opt={
    "host": "localhost",
    "port": 6379,
    "db": 0
};
redisvalid(opt).done(function(){console.log('111')},function(){console.log('222')});
var redismatrix=require('../lib/redis/matrix').matrix
var c=redismatrix(opt)
*/

//var util = require('util');
//var mytest=require('../lib/core/$include');
//console.log(mytest(path.resolve('./app'),['demo']));



