
var elitech = require('elitech-reader');
var underscore = require('underscore');
var request = require('request');
var sleep = require("sleep");
var fs = require('fs');

process.on('uncaughtException', function(err) {
    console.error(err);
});

var device_info = false;

function getConfigFile() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/config.json';
}
function read_last_date() {
  try {
    var obj = JSON.parse(fs.readFileSync(getConfigFile(), 'utf8'));
      // console.log(obj.lastUpdate);
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



function proccess_data_acquisition(data) {
  console.log(" Readed " + data.length);
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

// console.log(JSON.stringify(data_to_send));
  console.log(JSON.stringify(last_timestamp));

  request.post({url: 'http://mca-central.herokuapp.com/temperatureData',
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    }, body: data_to_send}, function(err,httpResponse,body){
      console.log("Err: " + err);
      console.log("Respose: " + httpResponse);
      console.log("Body: " + body);
  });

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

function systemMeasurement() {
  elitech.getElitechReader()
    .then(port => {
      console.log("Starting device on port " + port.comName)
      var device = elitech.getDevice(port.comName);
      device.open()
          .then(() => device.getDeviceInfo())
          .then(info => store_device_info(info))
          .then(() => device.getData(last_timestamp))
          .then(result => {proccess_data_acquisition(result)}, error => {console.error(error)})
          .then(() => device.close(function(err) {console.log(err)}))
          .then(() => setTimeout(systemMeasurement, 10000));
  }, error => {
    console.error(error);
    process.exit(1);
  });
};


systemMeasurement();



// process.stdin.readLine();
