var fs = require('fs');
var request = require('request');

var data = [];
var array = [];
var mostRecentNum = 0;
var num;
var dir = 'C:/elitech-datareader-0.9.1/build/scripts-2.7';
var location =  process.argv[2];

fs.watch(dir, function (event, filename) {
    console.log('Detecting ' + event + ' event for file: ' + filename);
    if (filename) {
		array = fs.readFileSync(dir + "/" + filename).toString().split("\n");
        
        for (i in array) {

            if (array[i] !=="" && array[i] !==" " && array[i] !== null) {
                var subarray = array[i].split("\t");
                num =  parseInt(subarray[0]);
                if (mostRecentNum < num) {
                    var time = subarray[1].replace(" ", "T");
                    var temp = subarray[2].substring(0, subarray[2].length-1);

                    var obj = '{"location": "' + location + '","timestamp":"'+ time + '","temperature":"'+ temp +'"}';
                    var json = JSON.parse(obj);
                    console.log(obj);

                    data.push(json);
                }
            }
            
        }
        mostRecentNum = num;
        options.json = data;
        if (data.length > 0) {
            console.log("Sending:" + JSON.stringify(data));
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("Response: " + body);
					
                } else if(response.statusCode == 400) {
                    console.log("Bad request");
					
                } else {
                    console.log(error);
                }
            });
        }

        data = [];
        
    } else {
        console.log('Filename not provided');
    }
});

var options = {
  uri: 'http://mca-central.herokuapp.com/temperatureData',
  method: 'POST',
  json: array
};
