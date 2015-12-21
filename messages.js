var Parser = require('binary-parser').Parser;

function DeviceMessagesModule() {

  var bin2String = function(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    {
      case 0:
        break;
      case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
  };

  var interval_unpack = function(data) {
    var fields = new Parser().endianess('big').uint8('hour').uint8('min').uint8('sec').parse(new Buffer(data, 'ascii'));
    return new Date(0,0,0,fields.hour,fields.min, fields.sec,0);
  };

  var datetime_unpack = function(data) {
    var date = new Parser().endianess('big').uint16('year').uint8('month').uint8('day').uint8('hour').uint8('min').uint8('sec').parse(new Buffer(data,'ascii'));
    return new Date(date.year, date.month-1, date.day, date.hour, date.min, date.sec, 0);
  };

  this.InitRequest = function() {
    this.getMessage = function() {
      return new Buffer("CC000A00","hex");
    };
  };

  this.InitResponse = function() {
    this.readData = function(data){
        //do nothing
    };
  };


  this.DeviceInfoRequest = function() {
    this.getMessage = function() {
      return new Buffer("CC000600","hex");
    };
  };

  this.DeviceInfoResponse = function() {
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
      console.log(data);
      console.log("Buffer lenght: " + data.length);
          /*
             '>1s'
            'b'  # station no
            '3s'
            '3s'  # record interval hh mm ss
            'h'  # upper limit
            'h'  # lower limit
            '7s'  # last_online
            'b'  # work_status
            '7s'  # start_time
            'b'  # stopbutton permit=0x13, prohibit=0x31
            'b'
            'h'  # record_count
            '7s'  # current_time
            '100s'  # info
            '10s'  # device number
            'b'  # delaytime
            'b'  # tone set
            'b'  # alarm
            'b'  # temp unit
            'b'  # temp calibration
            '7s',
      */
      // var array = jspack.Unpack('>1sb3s3shh7sb7sbbh7s100s10sbbbbb7s', data);
      var fields = new Parser()
                      .endianess('big')
                      .uint8('headerByte')
                      .uint8('station_no')
                      .array('reserved1', { type: 'uint8', length: 3 })
                      .array('rec_interval', { type: 'int8', length: 3 })
                      .int16be('upper_limit')
                      .int16be('lower_limit')
                      .array('last_online', { type: 'uint8', length: 7 })
                      .uint8('work_status')
                      .array('start_time', { type: 'uint8', length: 7 })
                      .uint8('stop_button')
                      .uint8('reserved2')
                      .int16be('rec_count')
                      .array('current_time', { type: 'uint8', length: 7 })
                      .array('user_info', { type: 'uint8', length: 100 })
                      .array('dev_num', { type: 'uint8', length: 10 })
                      .uint8('delay_time')
                      .uint8('tone_set')
                      .uint8('alarm')
                      .uint8('temp_unit')
                      .uint8('temp_calibration')
                      .array('reserved3', { type: 'uint8', length: 7 }).parse(data);


      this.station_no = fields.station_no;
      this.rec_interval = interval_unpack(fields.rec_interval);
      this.upper_limit = fields.upper_limit / 10.0;
      this.lower_limit = fields.lower_limit / 10.0;
      this.last_online = datetime_unpack(fields.last_online);
      this.work_status = fields.work_status;
      this.start_time = datetime_unpack(fields.start_time);
      this.stop_button = fields.stop_button;
      this.rec_count = fields.rec_count;
      this.current = datetime_unpack(fields.current_time);
      this.user_info = bin2String(fields.user_info);
      this.dev_num = bin2String(fields.dev_num);
      this.delay = (fields.delay_time / 16.0) + (0.5 * (fields.delay_time % 16));
      this.tone_set = fields.tone_set;
      this.alarm = fields.alarm;
      this.temp_unit = fields.temp_unit;
      this.temp_calibration = fields.temp_calibration/10.0;
      return this;
    };
  };

  this.DataHeaderRequest = function(target_station_no) {
    this.target_station_no = target_station_no;

    this.getMessage = function() {
      /*
      ">b"    # 0x33
      "b"     # target station no
      "b"     # command: datahead 0x01
      "b",    # page number 0x00
      */
      var buff = new Buffer();
      buff.writeUInt8(0x33);
      buff.writeUInt8(this.target_station_no);
      buff.writeUInt8(0x01);
      buff.writeUInt8(0x00);
    };
  };

  this.DataHeaderResponse = function() {
    this.rec_count = 0;
    this.start_time = false;

    this.readData = function(data) {
        /*
        '>1s'
        'h'  # record_count
        '7s'  # current_time
        'b',
        */
        var fields = new Parser().endianess('big').uint8('headerByte').int16('rec_count').array('date', {
            type: 'uint8',
            length: 7
        }).parse(data);

        this.rec_count = fields.rec_count;
        this.current_time = datetime_unpack(fields.date);

        return this;
    };
  };


  this.DataBodyRequest = function(_target_station_no, _page_num) {
    this.target_station_no=_target_station_no;
    this.page_num = _page_num;

    this.getMessage = function() {
      /*
      ">b"    # 0x33
      "b"     # target station no
      "b"     # command databody 0x02
      "b",    # page number
      */
      var buff = new Buffer();
      buff.writeUInt8(0x33);
      buff.writeInt8(this.target_station_no);
      buff.writeInt8(0x02);
      buff.writeInt8(this.page_num);
      return buff;
    };
  };

  this.DataBodyResponse = function(_count) {
    this.count = _count;
    this.records = [];
    this.start_time = false;

    this.readData = function(data) {
      console.log("Reading " + this.count + " measurements from data. Size: " + data.length);
      var fields = new Parser().endianess('big').uint8('headerByte').array('records', {type:'int16be',length: this.count}).parse(data);
      for(i=0;i<this.count;i++) {
        this.records[i] = fields.records[i] / 10.0;
      }
      return this;
    };
  };
}


exports.DeviceMessagesModule = DeviceMessagesModule;
