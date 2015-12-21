var jspack = require('jspack').jspack;
var Parser = require('binary-parser').Parser;

var interval_unpack = function(data) {

  var result = 0;
  for(i=0;i<data.length;i++) {
    result = result + data.charCodeAt(i) << 8*(data.length-i-1);

    // console.log(data.charCodeAt(i));
  }


  result = result * 1000;


  // var timestamp = date.a << 16 + data.b << 8  + data.c;
  // console.log(timestamp);


  // console.log(date);
  // return new Date(0, 0, 0, date.hour, date.min, date.sec, 0).getTime();
  return new Date(result);
};


var datetime_unpack = function(data) {
  var date = new Parser().endianess('big').uint16('year').uint8('month').uint8('day').uint8('hour').uint8('min').uint8('sec').parse(new Buffer(data,'ascii'));
  return new Date(date.year, date.month-1, date.day, date.hour, date.min, date.sec, 0);
};

function Device() {


}


function InitRequest() {
  getMessage = function() {
    return new Buffer("CC000A00D6","hex");
  };
}

function InitResponse() {
  readData = function(data){
      //do nothing
  };
}


function DeviceInfoRequest() {
  getMessage = function() {
    return new Buffer("CC000600D2","hex");
  };
}

function DeviceInfoResponse() {
  this.station_no = 0;
  this.rec_interval = '';
  this.upper_limit = '';
  this.lower_limit = '';
  this.last_online = '';
  this.work_sts = '';
  this.start_time = '';
  this.stop_button = '';
  this.rec_count = '';
  this.current = '';
  this.user_info = '';
  this.dev_num = '';
  this.delay = '';
  this.tone_set = '';
  this.alarm = '';
  this.temp_unit = '';
  this.temp_calibration = '';

  this.readData = function(data) {
    var array = jspack.Unpack('>1sb3s3shh7sb7sbbh7s100s10sbbbbb7s', data);
    this.station_no = array[1];
    this.rec_interval = interval_unpack(array[3]);
    this.upper_limit = array[4] / 10.0;
    this.lower_limit = array[5] / 10.0;
    this.last_online = datetime_unpack(array[6]);
    this.work_status = array[7];
    this.start_time = datetime_unpack(array[8]);
    this.stop_button = array[9];
    this.rec_count = array[11];
    this.current = datetime_unpack(array[12]);
    this.user_info = array[13];
    this.dev_num = array[14];
    this.delay = (array[15] / 16.0) + (0.5 * (array[15] % 16));
    this.tone_set = array[16];
    this.alarm = array[17];
    this.temp_unit = array[18];
    this.temp_calibration = array[19]/10.0;
    return this;
  };
}

// DeviceInfoResponse.prototype.

var devinfoResponse = ('55 01 01 28 0A 00 00 0A 02 58 FE D4 07 DF 0C 12'+
 '11 3B 1E 01 07 DF 0C 12 0F 3A 29 31 64 05 F3 07'+
 'DC 01 01 01 3B 27 52 43 2D 34 20 44 61 74 61 20'+
 '4C 6F 67 67 65 72 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00'+
 '00 00 00 00 00 00 00 00 00 00 FF FF FF FF FF FF'+
 'FF FF FF FF 00 31 00 31 00 00 00 00 00 00 00 E1').split('\n').join('').split(' ').join('');


var x = new DeviceInfoResponse();
x.readData(new Buffer(devinfoResponse, 'hex'));
console.log(x);
