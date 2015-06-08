/**
 * Created by Administrator on 2015/3/17.
 */

var  qb=require('../qb')
    ,Q=require('q')
var basecache={};
var bureaucache={};

function setBaseCache(bases){
    bases.forEach(function(item){
        if (item['CODE_TYPE']!=='0') return ;
        basecache[item['CODE_ID']]={};//{'$CODE_NAME':item['CODE_NAME']};
    })
    bases.forEach(function(item){
        if (item['CODE_TYPE']==='0') return ;
        var tp=basecache[item['CODE_TYPE']];
        if (!tp) return ;
        tp[item['CODE_ID']] = item;
    })
}
function setBureau(bureaus){
    bureaus.forEach(function(item){
        bureaucache[item.MARK_BUREAU]=item;
    });
}

var bureauRule=/^[浙京津沪渝冀豫云辽黑湘皖鲁苏赣粤鄂桂甘晋蒙陕吉闽贵青藏川宁新琼]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
exports.getBureau=function (carMark){
    if (!bureauRule.test(carMark)) return ;
    var data=bureaucache;
    if (!carMark) return ;
    return data[carMark.slice(0,2)];
}

exports.getBase=function (typename,codeid){
    var data=basecache;
    typename&&data&&(data=data[typename]);
    if (!data) return ;
    codeid&&data&&(data=data[codeid]);
    if (!data) return ;
    return data;
}

exports.getrandpassword = function (tel) {
    var Num = "";
    for (var i = 0; i < 6; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    //
    return Num;
}

exports.cust2user = function (cust) {
    var user = {};
    cust['CUST_ID'] && (user['USER_ID'] = cust['CUST_ID']);
    cust['CUST_NO'] && (user['USER_NO'] = cust['CUST_NO']);
    cust['CUST_NAME'] && (user['USER_NAME'] = cust['CUST_NAME']);
    cust['CUST_PWD'] && (user['USER_PWD'] = cust['CUST_PWD']);
    return user;
}

exports.user2cust = function (user) {
    var cust = {};
    user['USER_ID'] && (cust['CUST_ID'] = user['USER_ID']);
    user['USER_NO'] && (cust['CUST_NO'] = user['USER_NO']);
    user['USER_NAME'] && (cust['CUST_NAME'] = user['USER_NAME']);
    user['USER_PWD'] && (cust['CUST_PWD'] = user['USER_PWD']);
    return cust;
}

exports.pushpwd = function (tel,pwd) {

}

exports.init=function() {
   return  Q.all([qb.quickTable({$table:'sys_base'}),qb.quickTable({$table:'sys_mark_bureau'})])
        .spread(function(baselist,bureaulist){
            setBaseCache.call(null,baselist);
           setBureau.call(null,bureaulist);
        })
}

