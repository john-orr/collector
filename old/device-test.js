
var devInfoRequest = new Buffer("CC000600D2", "hex");
var sleep = require('sleep');

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 115200
}, false);

serialPort.on('data', function(data) {
  console.log('data received: ' + data.toString('hex'));

  serialPort.close(function(err) {
    console.error(err);
  });

});

serialPort.on('close', function() {
  console.log('stream closed: ');
});

serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
  }
});


function teste() {
  console.log("BING!" + serialPort.isOpen());




  serialPort.open();

  sleep.usleep(5000000);
  serialPort.write(devInfoRequest, function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });

  // sleep.usleep(5000000);
  setTimeout(teste,15000);

}


teste();






// var deviceClass =  require('./device.js').DeviceModule;
// var device = new deviceClass('/dev/ttyUSB1',3);
//
// // var resp1 = device.device_info();
// // var sleep =  require('sleep');
//
// // sleep.sleep(3);
// var all_data_array = [];
//
//
//
// device.open(function() {
//
//   device.device_info(function(devinfo, err){
//     console.log('DEVICE INFO .... ');
//     if(devinfo) {
//       console.log(devinfo);
//       device.get_header(devinfo.station_no, function(header, err) {
//         if(header) {
//         console.log('GET HEADER .... ');
//         console.log(header);
//
//         var pageSize = 100;
//         var recordCount = devinfo.rec_count;
//         var pages = Math.ceil(devinfo.rec_count/pageSize);
//         var recordsLastPage = recordCount % pageSize;
//
//
//
//
//
//         device.load_all_data(false, devinfo.station_no, devinfo.start_time, devinfo.rec_interval, pages-1, recordsLastPage, function(records) {}, function(all) {
//           console.log(all);
//           console.log("total records loaded: " + all.length);
//         });
//         }
//       });
//     }
//   });
// });
//
//
// // device.init_device(function(response, err) {
// //   if(!err && response) {
// //     console.log("init response got");
// //     console.log(response);
// //     start_aquisition();
// //   }
// // });
//
//
//
//
//
// // console.log(devInfoResp);
// // var resp2= device.get_header(devInfoResp.station_no); // devInfoResp.station_no
// // console.log(resp2);
// // var resp3 = device.get_measurements(1, 1, 100);
//
// // var resp = device.device_info();
// // console.log(resp1);
// // console.log(resp1);
//
//
//
//
//
//
//
//
//
//
//
// //
// //
// // testCheckSum = function() {
// //   console.log("RAW:")
// //   var buff = new Buffer("CC000600D2","hex");
// //   for(i=0;i<buff.length;i++) {
// //     console.log(buff[i]);
// //   }
// //
// //   console.log("My supper check sum calculator:")
// //   var buff = device._append_check_sum(new Buffer("CC000600","hex"));
// //   for(i=0;i<buff.length;i++) {
// //     console.log(buff[i]);
// //   }
// // };
