/**
 * Created by Administrator on 2015/3/13.
 */
var cluster = require('cluster')
    , numCPUs = require('os').cpus().length;

exports=module.exports=function(app){
    if (cluster.isMaster) {
        console.log("master start...pid="+process.pid+' port:'+app.get('port'));
        for (var i = 0; i < numCPUs; i++) {
            var wk=cluster.fork();
            wk.send('[master] ' + 'hi worker' + wk.id);
        }
        cluster.on('listening', function (worker, address) {
            console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
        });
        cluster.on('exit', function (worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
            var wk=cluster.fork();
            wk.send('[master] ' + 'hi worker' + wk.id);
        });
    }else{
        process.on('message', function(msg) {
            console.log('[worker] '+msg);
            process.send('[worker] worker'+cluster.worker.id+' received!');
        });
        var server = app.listen(app.get('port'), function() {
            //console.log('Express server listening on port ' + server.address().port);
        });
    }
}
