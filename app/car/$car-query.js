/**
 * Created by Administrator on 2015/3/26.
 */
var path=require('path')
    ,mcomm=require(path.resolve('lib/mid-comm'))
    ,scomm=require(path.resolve('lib/self-comm'))
    ,bcomm=require(path.resolve('lib/biz-comm'))
    ,custMgr=require('./mgr/cust-busi-mgr')
    ,LOG=scomm.logger()
    ,Q=mcomm.Q
    ,qb=scomm.qb;




exports=module.exports  =function (){

    //if (!custinfo) return scomm.qError( mcomm.util.format('用户不存在或未登录!'));
    function getIllegalQueryTask() {
        var self = this;
        var conn;
        qb(true).then(function (db) {
            conn=db
            return qb.select(conn,{table:'task_record'},{cond:{},condext:' 1=1 order by  busi_priority  desc  limit 20'})
        }).done(function (recs) {
            var recs=recs||[];
            recs.forEach(function(item){
                self.trimNull( item)
            })
            self.json(recs);
            return qb.complete(conn);
        }, function (err) {
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }


    function setIllegalQueryTask() {
        var self = this;
        var conn;
        qb(true).then(function (db) {
            conn=db
            return qb.select(conn,{table:'task_record'},{cond:{},condext:' 1=1 order by  busi_priority  desc  limit 20'})
        }).done(function (recs) {
            var recs=recs||[];
            recs.forEach(function(item){
                self.trimNull( item)
            })
            self.json(recs);
            return qb.complete(conn);
        }, function (err) {
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }


    function approveRemoteIllegal(taskrec,cust,car,newCar){
        var conn;
        qb().then(function (db) {
            conn=db
            if (!car&&newCar){
                newCar.CREATE_DATE=new Date();
                newCar.LAST_APPROVE_TIME=new Date();
                newCar.LAST_APPROVE_FLAG='unknow';
                newCar.FREE_QUERY_CNT=20;
                newCar.CAR_STATUS='normal';
                return qb.insert(conn,{table:'cm_car'},{value:newCar});
            }else{
                return qb.update(conn,{table:'cm_car'},{value:{LAST_APPROVE_TIME:new Date(),LAST_APPROVE_FLAG:'unknow'},cond:{CAR_ID:car.CAR_ID}})
            }
        }).then(function(){
            return qb.insert(conn,{table:'task_record'},{value:taskrec});
        }).done(function () {  //end
            return qb.complete(conn);
        }, function (err) {
            LOG.error(err);
            return conn&&qb.failure(conn);
        })
    }

    function illegalqueryByMark() {
        var self = this;
        var conn;
        var raw = {}
        var custid=self.req&&self.req.session&&self.req.session.user&&self.req.session.user?self.req.session.user.USER_ID:undefined;
        //session_id=self.req.session.id;
        var carmark=self.fields['CAR_MARK'];
        var carident=self.fields['CAR_IDENT'];
        var carkind=self.fields['CAR_KIND']||'1003001';
        var custtel=self.fields['CUST_TEL'];
        var bureauInfo=bcomm.getBureau(carmark);
        if (!bureauInfo){
            return self.jError('输入的牌照信息错误!');
        }
        var custinfo,carinfo,taskrec={},querylog={};
        Q.all([ custMgr.getCustById(custid),custMgr.getCarByMark(carmark),self.newDoneId(),self.newDoneId(),self.newDoneId()
        ]).spread(function (cust,car,tskid,lgid,carid) {
            custinfo=cust,      carinfo=car,         querylog.LOG_ID=lgid;
            if (custMgr.needApproveIllegal(car)) {
                taskrec.TASK_ID=tskid;
                taskrec.BUSI_TYPE='11001';
                taskrec.CAR_MARK=carmark;
                taskrec.CAR_IDENT=carident;  //for zhejiang
                taskrec.CAR_KIND= carkind;
                var newCar;
                if (!car){
                    newCar= {CAR_ID:carid,CAR_MARK:carmark,CAR_IDENT:carident,CAR_KIND:carkind,MARK_BUREAU:bureauInfo.MARK_BUREAU}
                }
                custMgr.setTaskRec(taskrec,custinfo,carinfo,bureauInfo);
                custMgr.setTaskPrioty(taskrec,custinfo,carinfo);
                approveRemoteIllegal.call(self,taskrec,cust,car,newCar)
            }
            querylog.BUSI_TYPE='11001';
            querylog.CAR_MARK=carmark;
            querylog.CAR_IDENT=carident;
            querylog.CAR_KIND= carkind;
            custMgr.setQueryLog(querylog,custinfo,carinfo,self.req.session);
            return qb()
        }).then(function (db) {
            conn=db
            return qb.insert(conn,{table:'cm_query_log'},{value:querylog});
        }).then(function (db) {
            return qb.select(conn,{table:'cm_ticket'},{cond:{CAR_MARK:carmark},condext:'1=1'})
        }).done(function (tickets) {
            //self.json(self.trimNull( actor.cust));
            var tickets=tickets||[];
            tickets.forEach(function(item){
                self.trimNull( item)
            })
            self.json(tickets);
            return qb.complete(conn);
        }, function (err) {
            self.jError(err);
            LOG.error(err);
            return conn&&qb.failure(conn);
        })

    }

    ;!function(){
    }();



    return [illegalqueryByMark,getIllegalQueryTask];

}()

