
/* required modules */
var elitech = require('elitech-reader');
var underscore = require('underscore');
var fs = require('fs');
var request = require('request');


/* module code */
function getCollector(attributes) {

  var webservice_url = false; /* POST application/json webservice url. False means that data won't be uploaded */
  var serial_port = false; /* stores device USB/COM port. If false, we'll try to discover USB ones */
  var device_info = false; /* stores devise information (acquired every measurement cycle) */
  var last_timestamp = false; /* last measurement date. It is used to ensure that we'll retrieve just the latest measurements from the datalogger */
  var upload_interval = 10; /* data upload to server inverval. In seconds. 10 is default */
  var upload_page_size = 1000; /* max data allowed per webservice request */
  var __ws_parser_callback = function(device, record) {
    return {
      location: device.info,
      temperature: record.temp,
      timestamp: record.time.replace('.000Z','')
    };
  };

  /* Stores device information into device_info variable. It exits if we're not able to retrieve it. */
  function store_device_info(info) {
    if(info.info == '') {
      console.log('Device identifier(info) is blank. Exiting');
      process.exit(0);
    } else {
      console.log(info.info);
      device_info=info;
    }
  }

  /* Reads last measuremnt date from config file */
  function read_last_date() {
    try {
      var obj = JSON.parse(fs.readFileSync(getConfigFile(), 'utf8'));
        return obj.lastUpdate;
      }catch(error) {
        return false;
      }
  }

  /* Stores last measurement date into config file */
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

  /* Prints all system params */
  function print_params() {
    console.log(`Webservice url: <<<${webservice_url}>>>`);
    if(!webservice_url) {
      console.log('..... Data upload is <<<DISABLED>>>!');
    }

    console.log(`Upload interval: <<<${upload_interval}>>>`);
    console.log(`Upload page size: <<<${upload_page_size}>>>`);
    console.log(`Elitech RC-4 Serial Port: <<<${serial_port}>>> ('false' means that it'll be retrieved automatically from operating system)`);
    console.log(`Last upload timestamp: <<<${last_timestamp}>>>`);
  }

  /* Initializes system params */
  function setup() {
    return new Promise((resolve,reject) => {
      if(attributes.ws) {
        webservice_url = attributes.ws;
      }

      if(attributes.upload_interval) {
        upload_interval = attributes.upload_interval;
      }

      if(attributes.upload_page_size) {
        upload_page_size = attributes.upload_page_size;
      }

      if(attributes.port) {
        serial_port = attributes.port;
      }

      if(attributes.data_parser) {
        __ws_parser_callback = attributes.data_parser;
      }

      last_timestamp = read_last_date(); /* trying to retrieve it from config file */

      print_params();

      resolve();
    });
  }

  /* Returns config file path (user home) */
  function getConfigFile() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/config.json';
  }

  /* Sends data to remote webservice */
  function send_data_to_server(data) {
    if(webservice_url) {
      console.log('Pushing data to server ... ');
      var pageSize = upload_page_size;
      var page = 1;
      while(data.length > 0) {
        var data_to_send = data.splice(0,pageSize);
        console.log(`Uploading page ${page} with ${data_to_send.length} measurements.`);
        page++;

        request.post({url: webservice_url,
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
    } else {
      console.log('Data pushing skipped.')
    }
  }

  /* Process data acquisition. Transforms data to webservice pattern */
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
    var data_to_send = [];
    for(i=0;i<data.length;i++) {
      data_to_send.push(__ws_parser_callback(device_info, data[i]));
    }

    send_data_to_server(data_to_send);

  }

  function run_once_internal(port) {
    console.log('Starting measuremnt process on device: ' + port);
    return new Promise((resolve, reject) => {
      var device = elitech.getDevice(port);
      device.open()
          .then(() => device.getDeviceInfo(), error=>reject(error))
          .then(info => store_device_info(info), error=>reject(error))
          .then(() => device.getData(last_timestamp), error=>reject(error))
          .then(result => {proccess_data_acquisition(result)}, error => reject(error))
          .then(() => device.close())
          .then(() => resolve());
    });
  }

  /* start measurement process on port <port> */
  function run_internal(port) {
    console.log("Starting device on port " + port);
    return new Promise((resolve, reject) => {
      run_once_internal(port)
        .then(() => setTimeout(run_loop, upload_interval * 1000))
        .then(() => console.log(`Waiting ${upload_interval} seconds for the next measurement. `))
        .then(() => resolve());
    });
  }

  /* retrieves the serial port from local variable or from operating system */
  function get_serial_port() {
    return new Promise((resolve, reject) => {
      if(serial_port) {
        resolve(serial_port);
      } else {
        elitech.getElitechReader().then(port =>  {serial_port = port.comName; resolve(port.comName);}, error =>  reject(error));
      }
    });
  }

  /* runs just once */
  function run_once() {
    return new Promise((resolve, reject) => {
      get_serial_port()
        .then(port => run_once_internal(port))
        .then(a => resolve(a), b=>reject(b));
    });
  }

  /* run in loop  */
  function run_loop() {
    return new Promise((resolve, reject) => {
      get_serial_port()
        .then(port => run_internal(port))
        .then(a => resolve(a), b=>reject(b));
    });
  };


  /* visible functions */
  return {
    setup: setup,
    run_loop: run_loop,
    run_once: run_once,
    get_config_file: getConfigFile,
    list_ports: list_ports
	};
}

/* returns all serial ports */
function list_ports() {
  return new Promise((resolve, reject) => {
    elitech.getSerialPorts().then(ports=>resolve(ports), error=>reject(error));
  });
}

/* registering modules */
exports.getCollector = getCollector;
exports.list_ports = list_ports;
/* end */
