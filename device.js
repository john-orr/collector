



function DeviceModule(_serial_port, _timeout) {

  var deviceMessagesClass =  new require('./messages.js').DeviceMessagesModule;
  var deviceMessages =  new deviceMessagesClass();
  var sleep = require('sleep');

  var SerialPort = require("serialport").SerialPort;

  var serialConn = new SerialPort("/dev/ttyUSB0", {
    baudrate: 115200
    // parser: serialport.parsers.raw
  }, false); // this is the openImmediately flag [default is true]




  this.serial_port = _serial_port;
  this.timeout = _timeout;

  var serialWait = function() {
    sleep.usleep(500000);
  };

  var _dump_buffer = function(buffer) {
    console.log("Dump buffer length:" + buffer.length);
    var buff = _append_check_sum(new Buffer("CC000600","hex"));
    for(i=0;i<buff.length;i++) {
      console.log(buff[i]);
    }
    console.log("<< end")
  };

  var _append_check_sum = function(message) {
    var newMessage = new Buffer(message.length + 1);
    var sum = 0;
    for (var i = 0; i < message.length; i++) {
      newMessage.writeUInt8(message[i],i);
      sum += message[i];
    }
    sum = sum % 0x100;
    newMessage.writeUInt8(sum, message.length);
    return newMessage;
  };

  var _talk = function(request, response) {
    serialWait();
    serialConn.open();
    var message = _append_check_sum(request.getMessage());

    _dump_buffer(message);

    serialConn.on("open",function() {
      serialConn.write(message, function(err, results) {
        if(err) {
          serialConn.close();
        }
      });
    });
    serialConn.on('data', function(data) {
      console.log('data received: ' + data);
      // response.readData(data);
      serialConn.close();
    });
    return response;
  };

  this.init_device = function() {
    var initRequest = new deviceMessages.InitRequest();
    var initResponse = new deviceMessages.InitResponse();
    _talk(initRequest, initResponse);
  };


  this.device_info = function() {
    var request = new deviceMessages.DeviceInfoRequest();
    var response = new deviceMessages.DeviceInfoResponse();
    return _talk(request, response);

  };





}


exports.DeviceModule = DeviceModule;
