/**
 * Created by Administrator on 2014/12/26.
 */
//not
var hash=require('../util/hash').hash
    ,ncount=0
    ,cache={}

(function(){
    module.exports.add=function(sessid){
        var key=hash(sessid);
        var ltime=(new Date()).getTime()/1000;
        cache[key]= ltime
        ncount++;
    }

    function reset(){

    }


    setInterval(reset,10000);

})()


