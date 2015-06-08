/**
 * Created by Administrator on 2015/3/27.
 */
var path = require('path')
    ,mcomm=require(path.resolve('lib/mid-comm'))
    ,scomm=require(path.resolve('lib/self-comm'))
    ,bcomm=require(path.resolve('lib/biz-comm'))
    ,Q=mcomm.Q
    ,qb=scomm.qb
    ,LOG=scomm.logger()

exports.addSessionHisCar = function (newcust,oldssessid) {
    if (!newcust||!oldssessid) return ;
    var sql='select CAR_ID from cm_query_log where car_mark is not null and session_id=? limit 1';
    qb.quickSql(sql,[oldssessid]).then(function(carlist){
        var carid=carlist[0].CAR_ID;
        if (!carid) return Q() ;
        sql='update   cm_car set cust_id =? where cust_id is null and car_id =?';
        return qb.quickSql(sql,[newcust.CUST_ID,carid]);
    }) ;
}

exports.getCustById = function (custid) {
    if (!custid) return Q();
    var cond = {'$table':'cm_customer'}
    cond['CUST_ID']=custid;
    return qb.quickTable(cond,true);
}

exports.getCarByMark = function (mark) {
    if (!mark) return Q();
    var cond = {'$table':'cm_car'}
    cond['CAR_MARK']=mark;
    return qb.quickTable(cond,true);
}

exports.setTaskPrioty = function (rec,cust,car) {
    if (!car)   return (rec.BUSI_PRIORITY=100);
    if (!cust) return (rec.BUSI_PRIORITY=1);
    // if (cust.CUST_CLASS)
    rec.BUSI_PRIORITY=20
}

exports.setTaskRec = function (rec,cust,car,bureau) {
    if (cust){
        cust.CUST_ID && (rec.CUST_ID=cust.CUST_ID );
        cust.CUST_TEL && (rec.CUST_TEL=cust.CUST_TEL );
        cust.CUST_WCHAT && (rec.CUST_WCHAT=cust.CUST_WCHAT );
        cust.DRIVER_IDENT && (rec.DRIVER_IDENT=cust.DRIVER_IDENT );
    }
    if (car){
        car.CAR_ID && (rec.CAR_ID=car.CAR_ID );
        car.CAR_MARK&&!rec.CAR_MARK&& (rec.CAR_MARK=car.CAR_MARK );
        car.CAR_IDENT&&!rec.CAR_IDENT&& (rec.CAR_IDENT=car.CAR_IDENT );
        car.CARFRAME_NO&&!rec.CARFRAME_NO&& (rec.CARFRAME_NO=car.CARFRAME_NO );
        car.ENGINE_NO&&!rec.ENGINE_NO&& (rec.ENGINE_NO=car.ENGINE_NO );
        car.CAR_KIND&&!rec.CAR_KIND&& (rec.CAR_KIND=car.CAR_KIND );
    }
    rec.PROVINCE= bureau.PROVINCE;
    bureau. CITY &&(    rec.CITY=    bureau. CITY);
    bureau.COUNTY&&(   rec. COUNTY   =bureau.COUNTY) ;
    rec.CREATE_DATE=new Date();
    rec.TASK_REDO=5;
}

exports.setQueryLog = function (log,cust,car,session) {
    if (cust){
        cust.CUST_ID && (log.CUST_ID=cust.CUST_ID );
        cust.CUST_TEL && (log.CUST_TEL=cust.CUST_TEL );
        cust.CUST_WCHAT && (log.CUST_WCHAT=cust.CUST_WCHAT );
        cust.DRIVER_IDENT && (log.DRIVER_IDENT=cust.DRIVER_IDENT );
    }
    if (car){
        car.CAR_ID && (log.CAR_ID=car.CAR_ID );
        car.CAR_MARK&&!log.CAR_MARK&& (log.CAR_MARK=car.CAR_MARK );
        car.CAR_IDENT&&!log.CAR_IDENT&& (log.CAR_IDENT=car.CAR_IDENT );
        car.CARFRAME_NO&&!log.CARFRAME_NO&& (log.CARFRAME_NO=car.CARFRAME_NO );
        car.ENGINE_NO&&!log.ENGINE_NO&& (log.ENGINE_NO=car.ENGINE_NO );
        car.CAR_KIND&&!log.CAR_KIND&& (log.CAR_KIND=car.CAR_KIND );
    }
    log.CREATE_DATE=new Date();
    session&&session.id&&(log.SESSION_ID=session.id);
}

exports.needApproveIllegal = function (car) {
    if (!car) return true;
    var dn=new Date();
    if (car&&car.LAST_APPROVE_TIME&&car.LAST_APPROVE_FLAG) {
        dn = dn.getTime() - car.LAST_APPROVE_TIME.getTime();
        dn = Math.floor(dn / 1000 / 60);
        if (dn<=5) return false;
        if (dn>5 && dn<60 && car.LAST_APPROVE_FLAG==='equal' ) return false;
    }
    return true;
}