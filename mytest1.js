/**
 * Created by Administrator on 2015/1/13.
 */
//#!/usr/bin/env node

    /*
    *
    *    //this script only for test websocket
     var url = "ws://127.0.0.1:8012/rtm/ab/c";
     var  socket=window.MozWebSocket?new MozWebSocket(url):new WebSocket(url);
     socket.onopen = function(e) {
     socket.send('I am the client and I\'m listening!');
     socket.onmessage = function(e) {
     console.log(e.data)
     };
     socket.onclose = function(event) {
     console.log('Client notified socket has closed',event);
     };
     //socket.close()
     };
    * */


var WebSocketClient = require('websocket').client;






function WsClient(url){
    var client = new WebSocketClient();
    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        //console.log(connection)
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        });
        function sendNumber() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
                setTimeout(sendNumber, 1000);
            }
        }
        sendNumber();
    });
    client.connect(url);
}

for(var i=0;i<1;i++){
   WsClient('ws://127.0.0.1:8012/ws')
}
/*
var mycars=new Array("Saab","Volvo","BMW");

console.log(mycars.shift())
console.log(mycars.length);
console.log(mycars.push('aa'))
console.log(mycars.length);
console.log(mycars)


var httpProxy = require('http-proxy');
httpProxy.createServer({ target: 'ws://127.0.0.1:8012/ws', ws: true }).listen(8014);

var client = require('socket.io-client');
var ws = client.connect('ws://localhost:8014');
ws.on('message', function (msg) {
    util.debug('Got message: ' + msg);
    ws.send('I am the client');
});


var client = require('socket.io-client');
var ws = client.connect('ws://127.0.0.1:8012/ws');
ws.on('connection',function(){
    console.log('zzzzzzzzzzzzz');
})
ws.on('message', function (msg) {
    //util.debug('Got message: ' + msg);
    ws.send('I am the client');
});
*/



