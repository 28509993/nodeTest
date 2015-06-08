/**
 * Created by Administrator on 2015/3/19.
 */
Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}

Date.prototype.toDate = function(data){
    var str = data.replace(/-/g,"/");
    return new Date(str );
}

var obj={a:1,b:{c:'ccc',d:{e:new Date()}}}
function iteratesDate (obj) {
    var stype=Object.prototype.toString.call(obj);
    if (stype==="[object Array]") {
        for(var i= 0,k=obj.length;i<k;i++){
            iteratesDate(obj[i]);
        }
    }else if (stype==="[object Date]"){

    }else{

    }
}

