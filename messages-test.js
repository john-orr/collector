

var deviceMsgClass =  require('./messages.js').DeviceMessagesModule;
var deviceMsg = new deviceMsgClass();
// var sleep = require('sleep');
//     sleep.usleep(1000000)//sleep for 5 seconds

var devinfoResponse = ('55 01 01 28 0A 02 24 28 02 58 FE D4 07 DC 01 01'+
 '03 32 1C 00 07 DF 0C 12 0F 3A 29 31 64 00 00 07'+
 'DC 01 01 03 33 1F 52 43 2D 34 20 44 61 74 61 20'+
 '4C 6F 67 67 65 72 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 FF FF FF FF FF FF'+
 'FF FF FF FF 00 31 00 31 00 00 00 00 00 00 00 E6').split('\n').join('').split(' ').join('');


var measurementMessage = ('55 00 D1 00 D0 00 D0 00 D0 00 CF 00 CF 00 CF 00'+
' CF 00 D0 00 D0 00 D1 00 D2 00 D1 00 D1 00 D2 00'+
' D0 00 D1 00 D1 00 D2 00 D2 00 D2 00 D3 00 D3 00'+
' D1 00 D1 00 D1 00 D1 00 D0 00 D0 00 D0 00 D0 00'+
' D3 00 D3 00 D2 00 D1 00 D1 00 D1 00 D1 00 D1 00'+
' D1 00 D0 00 D0 00 D1 00 D1 00 D2 00 D1 00 D0 00'+
' D0 00 CF 00 CF 00 CF 00 CF 00 CF 00 CF 00 CF 00'+
' CF 00 CE 00 CE 00 CE 00 CE 00 CE 00 CE 00 CE 00'+
' CE 00 CD 00 CD 00 CD 00 CD 00 CD 00 CE 00 CE 00'+
' CE 00 CD 00 CD 00 CD 00 CD 00 CD 00 CC 00 CC 00'+
' CC 00 CC 00 CC 00 CC 00 CC 00 CC 00 CC 00 CB 00'+
' CB 00 CB 00 CB 00 CB 00 CB 00 CB 00 CA 00 CB 00'+
' CB 00 CB 00 CB 00 CB 00 CB 17').split('\n').join('').split(' ').join('');

//
// var initRequest = new deviceMsg.InitRequest();
// console.log(initRequest);
// console.log(initRequest.getMessage());
// // console.log(headerReq);


// var bodyResponse = new deviceMsg.DataBodyResponse(100);
// console.log(bodyResponse.readData(new Buffer(measurementMessage, 'hex')));


var devinfoResponseCall = new deviceMsg.DeviceInfoResponse();
console.log(devinfoResponseCall.readData(new Buffer(devinfoResponse, 'hex')));
