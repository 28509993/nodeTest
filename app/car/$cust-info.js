/**
 * Created by Administrator on 2015/3/15.
 */
var path=require('path')
    ,mcomm=require(path.resolve('lib/mid-comm'))
    ,scomm=require(path.resolve('lib/self-comm'))
    ,bcomm=require(path.resolve('lib/biz-comm'))
    ,custbusimgr=require('./mgr/cust-busi-mgr')
    ,LOG=scomm.logger()
    ,Q=mcomm.Q
    ,qb=scomm.qb;
/*
* function allPrpos(obj,i){
 var props ="";
 if(typeof(i)=="undefined") {

 i=1;
 }
 var s=getLeftStr(i);
 for(var p in obj){
 if(typeof(obj[p])=="object"){
 props = props+s+ p +"r"+ allPrpos(obj[p],++i);
 --i;
 }else if(typeof(obj[p])=="function"){
 //obj[p]();
 }else{
 props=props+s+p +"="+ obj[p] +"r";
 }
 }
 ret
* */


exports=module.exports  =function (){
    function custdemo() {
        var self = this;
        var conn;
        var actor={};
        var raw = {}
        actor.custid=self.fields['CUST_ID'];
        actor.custtel=self.fields['CUST_TEL'];
        //console.log(self.req.session.user.USER_ID)
        console.log(self.req.session)
        Q.all([ //init data
            self.newDoneId(),self.custLastDone(actor.custid),qb.quickTable({$table:'cm_customer',CUST_TEL:actor.custtel},true)
        ]).spread(function (newdone,lstdone,cust) {
            actor.newdone=newdone;
            actor.lstdone=lstdone;
            actor.custid=cust['CUST_ID'];
            return qb()
        }) .then(function (db) {
            conn = db;
            //biz-func 1
        }).then(function (a) {
            return qb.update(conn,{table:'cm_customer',cust_name:2},{value:{cust_name:'王敏'+actor.newdone},cond:{cust_id:actor.custid},condext:'1=1'})
        }).then(function(rst){

            return qb.select(conn,{table:'cm_customer'},{cond:{cust_id:actor.custid},condext:'1=1'})
        }).then(function (rst) {
            var inst=rst[0];
            inst.CUST_ID=actor.newdone;
            return qb.insert(conn,{table:'cm_customer'},{value:inst});
        }).then(function (rst) {
            return qb.remove(conn,{table:'cm_customer'},{cond:{cust_id:actor.newdone}});
        }).then(function(rst){
            console.log(rst)
        }).then(function(){
            return self.updateLastDone(conn,actor.custid,actor.lstdone,actor.newdone);
        }).then(function(){
            return qb.complete(conn);
        }).done(function () {  //end
            self.json(qb.options);
        }, function (err) {
            self.jError(err);
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }

    function custinfo() {
        var self = this;
        var conn;
        var actor={};
        var raw = {}
        if (!self.fields['CUST_ID']&&!self.fields['CUST_TEL']){
            self.jError('no customer key information!', 1011);
            return ;
        }
        actor.cond={};
        self.fields['CUST_ID']&&(actor.cond['CUST_ID']=self.fields['CUST_ID']);
        self.fields['CUST_TEL']&&(actor.cond['CUST_TEL']=self.fields['CUST_TEL']);
        actor.cond['$table']='cm_customer';
        qb.quickTable(actor.cond,true)
            .done(function(cust){
                cust? self.json(self.trimNull( cust)):self.jError('customer is not exists!');
            },function(err){
                self.jError(err);
            })
    }


    function custnew() {
        var self = this;
        var conn;
        var actor={};
        var raw = {}
        if (!self.fields['CUST_TEL']&&!self.fields['CUST_WCHAT']){
            self.jError('no customer tel information!', 1012);
            return ;
        }
        self.fields['CUST_TEL']&& ( actor.CUST_TEL=self.fields['CUST_TEL']);
        self.fields['CUST_WCHAT']&& ( actor.CUST_WCHAT=self.fields['CUST_WCHAT']);
        var sql= "select 1 ncount from cm_customer where cust_tel=? limit 1 ";
        var oldSessionid;
        Q.all([ //init data
            self.newDoneId(),qb.quickSql(sql,[actor.CUST_TEL])
        ]).spread(function (newdone,sqlrst) {
            if (sqlrst[0]) return scomm.qError( mcomm.util.format('%s already exists!',actor.CUST_TEL));
            actor.CUST_ID=newdone;
            actor.CUST_TEL=self.fields['CUST_TEL'];
            actor.CUST_NAME=self.fields['CUST_NAME']||actor.CUST_ID;
            actor.CUST_LAST_DONE=newdone;
            actor.CUST_PWD=bcomm.getrandpassword.call(null,actor.CUST_TEL);
            actor.CUST_LAST_DONE=newdone;
            actor.CUST_LAST_DONE=newdone;
            actor.CUST_TYPE='1001001';
            actor.CUST_CLASS= '1002001';
            actor.CREATE_DATE=new Date();
            actor.GRANT_FLAG='100000';
            actor.CUST_STATUS='normal';
            //send to mobile
            return qb()
        }) .then(function (db) {
            conn = db;
            return qb.insert(conn,{table:'cm_customer'},{value:actor});
        }).then(function(){
            oldSessionid=self.req.session.id;
            self.req.session.user=bcomm.cust2user.call(null,actor);
            return Q.all([qb.complete(conn),self.req.session.save()]);
        }).done(function () {
            bcomm.pushpwd.call(null,actor.CUST_TEL,actor.CUST_PWD);
            self.json({CUST_TEL:actor.CUST_TEL});
            custbusimgr.addSessionHisCar(actor,oldSessionid);
        }, function (err) {
            self.jError(err);
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }

    function custpwdrest() {
        var self = this;
        var conn;
        var actor={};
        var raw = {}
        if (!self.fields['CUST_TEL']){
            self.jError('no customer tel information!', 1012);
            return ;
        }
        actor.CUST_TEL=self.fields['CUST_TEL'];
        Q.all([ //init data
            self.newDoneId(),qb.quickTable({$table:'cm_customer',CUST_TEL:actor.CUST_TEL},true)
        ]).spread(function (newdone,cust) {
            if (!cust) throw new Error('tel not input!',1014) ;
            actor.cust=cust;
            actor.cond={CUST_ID:cust['CUST_ID'],CUST_LAST_DONE:cust['CUST_LAST_DONE']}
            return qb()
        }) .then(function (db) {
            conn = db;
            actor.pwd=bcomm.getrandpassword.call(null);
            return qb.update(conn,{table:'cm_customer',cust_name:2},{value:{CUST_PWD:actor.pwd},cond:actor.cond});
        }).then(function(rst){
            if (rst!==1) throw new Error('too fast,have a rest!',1015) ;
            return qb.complete(conn);
        }).done(function () {  //end
            bcomm.pushpwd.call(null,actor.cust['CUST_TEL'],actor.pwd);
            self.json({PWD:actor.pwd});
        }, function (err) {
            self.jError(err);
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }

    function custlogin() {
        var self = this;
        var conn;
        var actor = {};
        var raw = {}
        if (!self.fields['CUST_TEL'] || !self.fields['CUST_PWD']) {
            self.jError('no customer tel information!', 1012);
            return;
        }
        actor.CUST_TEL = self.fields['CUST_TEL'];
        actor.CUST_PWD = self.fields['CUST_PWD'];
        actor['$table']='cm_customer';
        var sql;
        qb.quickTable(actor,true)
            .then(function (cust) {
                if (!cust) return scomm.qError( mcomm.util.format('%s password error!',actor.CUST_TEL));
                //active customer
                sql="update cm_customer set cust_status='actived' where cust_id =? and cust_status='normal'";
                qb.quickSql(sql,[cust.CUST_ID]);
                self.req.session.user = bcomm.cust2user.call(null, cust);
                actor.cust=cust;
                return self.req.session.save();
            }).done(function () {  //end
                //
                //console.log(actor.cust.CREATE_DATE.format('yyyy-MM-dd hh:mm:ss'))
                delete actor.cust.CUST_PWD;
                self.json(self.trimNull( actor.cust));
            }, function (err) {
                self.jError(err);
                LOG.error(err);
            })
    }

    ;!function(){
        custinfo.auth=true;
    }();

    return [custdemo,custinfo,custnew,custpwdrest,custlogin];

}()

