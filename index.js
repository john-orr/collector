var request = require('request');

var options = {
  uri: 'http://mca-central.herokuapp.com/temperatureData',
  method: 'POST',
  json: {
    "temperature": "23"
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the shortened url.
  }
});