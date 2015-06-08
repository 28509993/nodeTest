/**
 * Created by Administrator on 2015/3/22.
 */
var  log4js = require('log4js');
exports=module.exports=function (name){
    var logger = log4js.getLogger(name||'normal');
    //logger.setLevel('INFO');
    return logger;
}

exports.init=function(options){
    if (!options) return ;
    log4jsConfigured={appenders:options, replaceConsole: false};
    log4js.configure(log4jsConfigured);
}

exports.use=function (){
    return log4js.connectLogger(exports('access'), {level:'trace', format:':method :url :status'});
}
