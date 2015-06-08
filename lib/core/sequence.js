/**
 * Created by Administrator on 2015/3/18.
 */
var qb=require('../qb')
    ,Q=require('Q')
    , yyyy=(new Date()).getFullYear()+'';
exports=module.exports=function  (seqname){
    var seq={
        current:0,
        maxvalue:0,
        increment:seqname==='seq_done'?500:10,
        waitlist:[]
    }
    var refhreshing=false;

    function getNewId(){
        if (seq.current<seq.maxvalue){
            seq.current++;
            return Q(yyyy+seq.current);
        }
        var deferred = Q.defer();
        seq.waitlist =seq.waitlist.concat(deferred);
        refresh();
        return deferred.promise;
    }
    function refresh(){
        if (refhreshing||seq.waitlist.length<=0) return ;
        refhreshing=true;
        var conn;
        qb(true).then(function (db) {
            conn = db;
            var sql = "call sp_nextval(?,?,@p_seq_id);";
            return  qb.query(conn, sql, [seqname,seq.increment]);
        }).then(function (rst) {
            seq.maxvalue=rst[0][0].p_seq_id;
            seq.current= seq.maxvalue-seq.increment;
            qb.complete(conn);
            var arr=[];
            for (var i= 0,n=seq.waitlist.length;i<n;i++){
                var p=seq.waitlist[i];
                if (seq.current<seq.maxvalue){
                    seq.current++;
                    p.resolve(yyyy+seq.current);
                }else{
                    arr[arr.length]=p;
                }
            }
            seq.waitlist=arr;
            refhreshing=false;
            refresh();
        }).fail(function (err) {
            console.log(err);
            qb.failure(conn);
            seq.waitlist.forEach( function(p){
                p.reject(err);
            })
            refhreshing=false;
        })
    }

    return getNewId;
}

