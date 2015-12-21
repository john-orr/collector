var deviceClass =  require('./device.js').DeviceModule;
var device = new deviceClass('/dev/ttyUSB0',3);
var resp = device.device_info();
console.log(resp);











//
//
// testCheckSum = function() {
//   console.log("RAW:")
//   var buff = new Buffer("CC000600D2","hex");
//   for(i=0;i<buff.length;i++) {
//     console.log(buff[i]);
//   }
//
//   console.log("My supper check sum calculator:")
//   var buff = device._append_check_sum(new Buffer("CC000600","hex"));
//   for(i=0;i<buff.length;i++) {
//     console.log(buff[i]);
//   }
// };
