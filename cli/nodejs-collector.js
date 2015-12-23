
var elitech = require('elitech-reader');
var underscore = require('underscore');
var request = require('request');
var sleep = require("sleep");
var fs = require('fs');
var getopt = require("node-getopt");


process.on('uncaughtException', function(err) {
    console.error(err);
});

var opt = getopt.create([
	["p", "port=<port>", "COM port (eg.: /dev/cu.SLAB_USBtoUART)"],
	// ["c", "command=<command>", "command (eg. data, devices)"],
	["h", "help", "display this help"]
]);


var args_command = opt.parseSystem().options;


var device_info = false;

function getConfigFile() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/config.json';
}
function read_last_date() {
  try {
    var obj = JSON.parse(fs.readFileSync(getConfigFile(), 'utf8'));
      return obj.lastUpdate;
    }catch(error) {
      return false;
    }
}

function write_last_date() {
  var out = {'lastUpdate': last_timestamp};
  fs.writeFile(getConfigFile(), JSON.stringify(out), function(err) {
    if(err) {
      console.log(err);
    } else {
      read_last_date();
    }
});
}


var last_timestamp = read_last_date();
// console.log(last_timestamp);
// process.exit(0);

function send_data_to_server(data) {

  var pageSize = 1000;

  var page = 1;
  while(data.length > 0) {
    var data_to_send = data.splice(0,pageSize);
    console.log(`Uploading page ${page} with ${data_to_send.length} measurements.`);
    page++;

    request.post({url: 'http://mca-central.herokuapp.com/temperatureData',
      method: "POST",
      json: true,
      headers: {
          "content-type": "application/json",
      }, body: data_to_send}, function(err,httpResponse,body){
        if(err) {
          console.error('Error uploading data to server: ' + err);
          console.error("Respose: " + httpResponse);
          console.error("Body: " + body);
        } else {
          console.log("Upload successful");
        }
    });
  }
}

function proccess_data_acquisition(data) {
  if(data.length < 1) {
    console.log("No data available.");
    return;
  }

  console.log("Data available: " + data.length);

  var record = underscore.max(data, record => new Date(record.time).getTime());

  last_timestamp = record.time;
  write_last_date();

  console.log(`Updating last_timestamp to ${last_timestamp}!`);
  console.log('Pushing data to server ... ');
  var data_to_send = [];
  for(i=0;i<data.length;i++) {
    data_to_send.push({
      location: device_info.info,
      temperature: data[i].temp,
      timestamp: data[i].time.replace('.000Z','')
    });
  }

  // send_data_to_server(data_to_send);

}

function store_device_info(info) {
  // console.log(info);
  if(info.info == '') {
    console.log('Device identifier(info) is blank. Exiting');
    process.exit(0);
  } else {
    console.log(info.info);
    device_info=info;
  }
}

function start_measurement(port) {
  console.log("Starting device on port " + port)
  var device = elitech.getDevice(port);
  device.open()
      .then(() => device.getDeviceInfo(), error=>{console.error(error);})
      .then(info => store_device_info(info), error=>{console.error(error);})
      .then(() => device.getData(last_timestamp), error=>{console.error(error);})
      .then(result => {proccess_data_acquisition(result)}, error => {console.error(error)})
      .then(() => device.close(function(err) {console.log(err)}))
      .then(() => setTimeout(systemMeasurement, 10000));
}

function systemMeasurement() {
  if(args_command.port) {
    start_measurement(args_command.port);
  } else {
    elitech.getElitechReader()
      .then(port => {
        start_measurement(port.comName);
    }, error => {
      console.error(error);
      process.exit(1);
    });
  };
};


systemMeasurement();



// process.stdin.readLine();
