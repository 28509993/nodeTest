#!/usr/bin/env node

var scomm=require('./lib/self-comm')
    ,mcomm=require('./lib/mid-comm')
    ,path = require('path')
    ,fs = require('fs')
    ,setting= require(path.resolve('setting.json'))
    ,qb=scomm.qb
qb.init(setting.mysql);

//SELECT DATABASE() as db;

var actor={}
var conn;
function showDB(conn_) {
    conn = conn_;
    actor.conn=conn;
    var sql = "SELECT DATABASE() as db";
    return  qb.query(conn, sql)
}
function switchDB(result) {
    actor.initdb=result[0].db;
    var sql='use information_schema';
    return  qb.query(conn,sql)
}

var tables=['cm_customer','sys_base','cm_car','cm_ticket','sys_mark_bureau','task_push',
'task_record','cm_query_log','cm_cust_car']

function genOrm(result) {
    var sql="select  table_name from tables where table_schema='"+actor.initdb+"'";
    var tabs=" and  table_name in ('"+tables.join("','")+"')";
    sql +=tabs;
    return qb.query(conn,sql)
        .then(function(result){
            actor.orms={}
            for (var i= 0,n=result.length;i<n;i++){
                var tab=result[i].table_name.toUpperCase();
                actor.orms[tab]={name:tab,columns:{}}
            }
            var sql="select table_name,column_name,data_type from columns where table_schema='"+actor.initdb+"'";
            sql +=tabs;
            return qb.query(conn,sql);
        })
        .then(function(result){
            for (var i= 0,n=result.length;i<n;i++){
                var col=result[i]
                for(var c in col){
                    col[c]=col[c].toUpperCase()
                }
                var orm=actor.orms[col.table_name];
                orm.columns[col.column_name]={type:col.data_type}
            }
            return actor.orms
        })
}

function saveOrms(result) {
    var deferred = mcomm.Q.defer();
    fs.writeFile(path.join('.', 'orms.json'), JSON.stringify(actor.orms, null, 4), 'utf8',function(err){
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve(actor.orms);
    });
    return deferred.promise;
}

qb(false)
    .then(showDB)
    .then(switchDB)
    .then(genOrm)
    .then(saveOrms)
    .then(function(result) {
        console.log(result+'');
    }).then(function() {
        return qb.complete(conn);
    }).fail(function(err){
        console.log(err)
        return qb.failure(conn);
    })



