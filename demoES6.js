"use strict";
var asyncReadFile = async function (){
    //var f1 = await readFile('/etc/fstab');
    //var f2 = await readFile('/etc/shells');
    //console.log(f1.toString());
    //console.log(f2.toString());
    console.log('11')
};
function * gFun() {
    var i = 0;
    //yield "第一个遍历器成员，第一次调用next()会停在这里"; //生成遍历器成员

   var d= setTimeout(function(){console.log('11111111111111')},2000)
    yield  d;

    while (true){
        console.log("第"+i+"次循环");
        var z= yield i; //生成遍历器成员
        console.log("继续第"+i+"次循环"+z);
        i++
    }
}

var g = gFun();  //没有.next()语句的调用，Generator函数不会执行，故不会造成while无限循环

console.log(g.next(11).value);
//"第一个遍历器成员，第一次调用next()会停在这里"
console.log(g.next(22).value);
//第0次循环
//0
console.log(g.next(33).value);
//1
//http://blog.drawable.de/2015/02/27/es6-in-webstorm-9-setting-up-a-filewatcher/