var elitech = require('elitech-reader');
var underscore = require('underscore');
var request = require('request');
var sleep = require("sleep");

process.on('uncaughtException', function(err) {
    console.error(err);
});


var last_timestamp = false;
var device_info = false;

function proccess_data_acquisition(data) {
  console.log(" Readed " + data.length);
  var record = underscore.max(data, record => new Date(record.time).getTime());

  last_timestamp = record.time;
  console.log(`Updating last_timestamp to ${last_timestamp}!`);
  console.log('Pushing data to server ... ');
  var data_to_send = [];
  for(i=0;i<1;i++) {
    data_to_send.push({
      location: device_info.info,
      temperature: data[i].temp,
      timestamp: data[i].time
    });
  }

console.log(JSON.stringify(data_to_send));
  // console.log(JSON.stringify(last_timestamp));

  // request.post('http://mca-central.herokuapp.com/temperatureData', {body: JSON.stringify(data_to_send)}, function(err,httpResponse,body){
  //     console.log("Err: " + err);
  //     console.log("Respose: " + httpResponse);
  //     console.log("Body: " + body);
  // });

  request({
    method: 'POST',
    // preambleCRLF: true,
    // postambleCRLF: true,
    uri: 'http://mca-central.herokuapp.com/temperatureData',
    multipart: [
      {
        'content-type': 'application/json',
        body: JSON.stringify(data_to_send)
      }
    ]
  },
  function (error, response, body) {
    if (error) {
      return console.error('upload failed:', error);
    }
    console.log(response);
    console.log(body);
  });
  // console.log(data_to_send);
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
          .then(() => device.close(function(err) {console.log(err)}));




      // try {
      //   device.open()
      //     .then(() => device.getData('2015-12-22T13:44:38.000Z'))
      //     .then(result => {console.log(result)}, error => {console.error(error)})
      //     .then(() => device.close());
      //   }catch(error) {
      //     console.error(error);
      //   }
  }, error => {
    console.error(error);
    process.exit(1);
  });
  setTimeout(systemMeasurement, 10000);
};
systemMeasurement();



// process.stdin.readLine();
