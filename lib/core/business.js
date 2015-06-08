/**
 * Created by Administrator on 2015/3/15.
 */
var  qb=require('../qb')
    ,Q=require('Q')
    ,sequence=require('./sequence');


var getseqdone;
var getseqcode;


;!function(){

    var Business=function(){

    }
    Business.prototype.trimNull=function(data,pad){
        if (!data) {
            return pad?{}:undefined;
        }
        for (var i in data){
            data[i]||(delete data[i])
        }
        return data;
    }

    Business.prototype.newCodeId=function(){
        getseqcode||(getseqcode=sequence('seq_code'))
        return getseqcode();
    }

    Business.prototype.newDoneId=function() {
        getseqdone||(getseqdone=sequence('seq_done'))
        return getseqdone();
    }

    Business.prototype.custLastDone=function(custid) {
        var self=this;
        var lstdone=self.fields&&self.fields['CUST_LAST_DONE']?self.fields['CUST_LAST_DONE']:undefined;
        if (lstdone) return lstdone;
        if (!custid) return ;
        var deferred = Q.defer()
            ,conn;
        qb(true).then(function (db) {
            conn = db;
            var sql = "select cust_last_done from cm_customer where cust_id=?";
            return  qb.query(conn, sql, [custid]);
        }).then(function (rst) {
            lstdone=rst.length>0?rst[0]['cust_last_done']:undefined;
        }).then(function () {
            qb.complete(conn);
            deferred.resolve(lstdone);
        }).fail(function (err) {
            qb.failure(conn);
            deferred.reject(err);
        })
        return deferred.promise;
    }

    Business.prototype.updateLastDone=function(conn,custid,lastdone,newdone) {
        if (!(conn&&custid&&lastdone&&conn.qb&&newdone)) return ;
        var self=this;
        var deferred = Q.defer()
            ,qb=conn.qb
            ,conn,lstdone;
        var sql = "update cm_customer set cust_last_done=? where cust_id=? and cust_last_done=?";
        qb.query(conn, sql, [newdone,custid,lastdone]).then(function (rst) {
             if (rst.affectedRows!==1) throw  new  Error("too fast,please try it agian!");
        }).then(function () {
            deferred.resolve();
        }).fail(function (err) {
            deferred.reject(err);
        })
        return deferred.promise;
    }

    Business.prototype.prepayCust=function(opt){

    }

    exports=module.exports=Business;
}();









