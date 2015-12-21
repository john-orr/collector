



function DeviceModule(_serial_port, _timeout) {

  var deviceMessagesClass =  new require('./messages.js').DeviceMessagesModule;
  var deviceMessages =  new deviceMessagesClass();
  var sleep = require('sleep');

  var SerialPort = require("serialport").SerialPort;

  var serialConn = new SerialPort("/dev/ttyUSB0", {
    baudrate: 115200
  }, false); // this is the openImmediately flag [default is true]




  this.serial_port = _serial_port;
  this.timeout = _timeout;

  var serialWait = function() {
    console.log('Waiting 500 ms');
    sleep.usleep(50000);
  };

  var _talk = function(request, response) {
    serialWait();
    serialConn.open();
    serialConn.on("open",function() {
      serialConn.write(initRequest.getMessage(), function(err, results) {
        console.log('err ' + err);
        console.log('results ' + results);
        serialConn.close();
      });
    });
    serialConn.close();
  };


  this.init_device = function() {
    var initRequest = new deviceMessages.InitRequest();
    var initResponse = new deviceMessages.InitResponse();
    talk(initRequest, initResponse);
  };

  //
  // this.device_info = function() {
  //   var deviceinfoRequest = new deviceMessages.DeviceInfoRequest();
  //   serialWait();
  //   serialConn.open();
  //   serialConn.on("open",function() {
  //     serialConn.write(deviceinfoRequest.getMessage(), function(err, results) {
  //       console.log('err ' + err);
  //       console.log('results ' + results);
  //       serialConn.close();
  //     });
  //   });
  // };
  //






}


exports.DeviceModule = DeviceModule;
