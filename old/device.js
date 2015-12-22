



function DeviceModule(_serial_port, _timeout) {

  var deviceMessagesClass =  new require('./messages.js').DeviceMessagesModule;
  var deviceMessages =  new deviceMessagesClass();
  var sleep = require('sleep');

  var SerialPort = require("serialport").SerialPort;

  var serialConn = new SerialPort(_serial_port, {
    baudrate: 115200,
    databits: 8,
    parity: 'none'
    // parser: serialport.parsers.raw
  }, false); // this is the openImmediately flag [default is true]





  this.serial_port = _serial_port;
  this.timeout = _timeout;

  var serialWait = function() {
    sleep.usleep(500000);
  };

  serialWait();

  this.close = function() {
      serialConn.close();
  };


  var sum = 0;
  var read_buffer = false;
  var serial_response = false;
  var serial_callback = false;
  var all_data_array = [];

  this.open = function(callback) {
    serialConn.open();
    serialConn.on("open",function() {
      serialConn.on('data', function(data) {
        if(read_buffer === false) {
          console.log('Error: buffer is not initialized');
          serial_callback(false, true);
          return false;
        }
        data.copy(read_buffer, sum, 0, data.length);
        sum += data.length;
        if(sum == serial_response.buffer_length()) {
          console.log('Packet received with size '+ sum );
          console.log('Message: ' +read_buffer.toString('hex'));
          resp_obj = serial_response.readData(read_buffer);
          // serialConn.close();
          serial_callback(resp_obj, false);
        } else if (sum > serial_response.buffer_length()) {
          serial_callback(false, true);
        }
      });
      callback();
    });

  };

  var _dump_buffer = function(buffer) {
    console.log("Dump buffer length:" + buffer.length);
    var buff = _append_check_sum(new Buffer("CC000600","hex"));
    for(i=0;i<buff.length;i++) {
      console.log(buff[i]);
    }
    console.log("<< end");
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




  var _talk = function(request, response, __callback) {
    console.log("Trying to send message ...");
    // serialConn.on("open",function() {
      console.log("Port is open now.");
      var message = _append_check_sum(request.getMessage());
      var resp_obj = false;
      serialWait();
      serialConn.write(message, function(err, results) {
        console.log("Data has been sent. Message:" + message.toString('hex'));
        if(!err) {
          sum = 0;
          read_buffer = new Buffer(response.buffer_length());
          serial_response = response;
          serial_callback = __callback;
        }else {
          sum = false;
          read_buffer = false;
          serial_response = false;
          serial_callback = false;
          __callback(false, true);

        }
      });
  };

  this.init_device = function(__callback) {
    var initRequest = new deviceMessages.InitRequest();
    var initResponse = new deviceMessages.InitResponse();
    _talk(initRequest, initResponse, __callback);
  };

  this.device_info = function(__callback) {
    var request = new deviceMessages.DeviceInfoRequest();
    var response = new deviceMessages.DeviceInfoResponse();
    return _talk(request, response, __callback);
  };

  this.get_header = function(target_station_no, __callback) {
    var request = new deviceMessages.DataHeaderRequest(target_station_no);
    var response = new deviceMessages.DataHeaderResponse();
    return _talk(request, response, __callback);
  };

  this.get_measurements = function(target_station_no, page_num, count, __callback) {
    var request = new deviceMessages.DataBodyRequest(target_station_no, page_num);
    var response = new deviceMessages.DataBodyResponse(count);
    return _talk(request, response, __callback);
  };





  this.load_all_data_rec = function(last_measurement, device_no, start_time, interval, page, records, __callback_recursive, __callback_finished) {
    var finished = false;
    if(page >= 0) {
      this.get_measurements(device_no, page, records, function(measurements, err) {
        if(measurements) {
          console.log("interval_ms:"+interval);
          var start_time_ms = new Date(start_time).getTime();
          for(i=measurements.count-1;i>=0;i--) {
            var time = new Date( start_time_ms + interval * (i + 1) );
            if(!last_measurement || time.getTime() > new Date(last_measurement).getTime()) {
              all_data_array.push({
                time: time.toISOString(),
                temperature: measurements.records[i] / 10.0
              });
            } else {
              finished  = true;
            }
          }
          if(!finished) {
            console.log("Loading page "  + page +" .");
            __callback_recursive(last_measurement, device_no, start_time, interval, page-1, 100, __callback_finished);
            // arguments.callee(last_measurement, device_no, start_time, interval, page-1, 100, __callback_finished);//last_measurement, device_no, start_time, interval, page-1, 100, __callback_finished);
          } else {
            __callback_finished(all_data_array);
          }
        }
      });
    } else {
      __callback_finished(all_data_array);
    }
  };

  this.load_all_data = function(last_measurement, device_no, start_time, interval, page, records, __callback_finished) {
    this.callbakRecursive = function(last_measurement, device_no, start_time, interval, page, records, __callback_finished) {
      this.load_all_data_rec(last_measurement, device_no, start_time, interval, page, records, __callback_finished);
    };

    this.load_all_data_rec(last_measurement, device_no, start_time, interval, page, records,this.callbakRecursive, __callback_finished);
  };

  this.get_data = function(last_measurement, devinfo, __callback) {
    var pageSize = 100;
    var recordCount = devinfo.rec_count;
    var pages = Math.ceil(devinfo.rec_count/pageSize);
    var recordsLastPage = recordCount % pageSize;


    this.load_all_data_rec(last_measurement, devinfo.device_no, devinfo.start_time, devinfo.rec_interval, pages-1, recordsLastPage, function(data) {
      console.log("All data received ...");
        __callback(data);
    });
  };


}


exports.DeviceModule = DeviceModule;
