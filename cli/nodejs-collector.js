#!/usr/bin/env node
var collector_module = require("../lib/nodejs-collector-module.js");
var getopt = require("node-getopt");

process.on('uncaughtException', function(err) {
    console.error(err);
});

var opt = getopt.create([
	["u", "url=<url>","Webservice url. Eg: http://somehost.com/temperatureData. Default: false (it means that no data will be uploaded)"],
  ["i", "interval=<interval>", "Upload interval: interval between data upload. Default: 10   (unit: seconds)"],
  ["s", "size=<size>", "Maximun page site to upload data to server. Default: 1000"],
  ["p", "port=<port>", "Serial port. Default: false (it means that collector will try to retrieve it from operating system)"],
  ["o", "once", "Run measurement cycle once and exit."],
  ["L", "loop", "Run measurement cycle in a loop. Type [ctrl+c] to exit."],
  ["l", "list", "List serial ports"],
	["h", "help", "display this help"]
]);

opt.setHelp(
  "Usage: node nodejs-collector.js [OPTION] --list|--once|--loop (one is required)\n" +
  "\n" +
  "[[OPTIONS]]\n" +
  "\n"
);


var args = opt.parseSystem().options;

var options = {};
if(args.url) {
  options.ws = args.url;
}
if(args.interval) {
  options.upload_interval = args.interval;
}
if(args.size) {
  options.upload_page_size = args.size;
}
if(args.port) {
  options.port = args.port;
}

options.data_parser = function(device, record) {
  return {
    location: 'I',
    temperature: record.temp,
    timestamp: record.time.replace('.000Z','')
  };
};

var collector = collector_module.getCollector(options);

if(args.list) {
  collector.list_ports().then(ports => {
    ports.forEach((row, idx) => {
      console.log(`${idx}: ${row.comName}  (${row.manufacturer})`);
    });
  });
} else if (args.once) {
  collector.setup(options)
      .then(() => console.log('Setup ready'))
      .then(() => collector.run_loop().then(() => console.log("End"), error => console.error(error)));
} else if (args.loop) {
  collector.setup(options)
      .then(() => console.log('Setup ready'))
      .then(() => collector.run_loop().then(() => console.log("End"), error => console.error(error)));
} else {
  opt.showHelp();
}




// console.log(options);
