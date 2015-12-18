var fs = require('fs');
var request = require('request');

var data = [];
var array = [];
var mostRecentNum = 0;
var num;
var dir = 'C:/elitech-datareader-0.9.1/build/scripts-2.7';

fs.watch(dir, function (event, filename) {
    console.log('event is: ' + event);
    if (filename) {
        console.log('filename provided: ' + filename);
        
        array = fs.readFileSync(dir + "/" + filename).toString().split("\n");
        
        for(i in array) {

            if(array[i] !=="" && array[i] !==" " && array[i] !== null){
                //console.log("array:[" + i + "]");
                var subarray = array[i].split("\t");
                //console.log("subarray:" + subarray);
                num =  parseInt(subarray[0]);
                if(mostRecentNum < num){

                    var time = subarray[1].replace(" ", "T");
                    var temp = subarray[2].substring(0, subarray[2].length-1);

                    var obj = '{"name": "' + num + '","timestamp":"'+ time + '","temperature":"'+ temp +'"}';
                    //console.log("about to parse");
                    var json = JSON.parse(obj);
                    //console.log("object:[" + JSON.stringify(json) + "]");

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
                  console.log(body); // Print the shortened url.
              }
            });
        }

        data = [];
        
    } else {
        console.log('filename not provided');
    }
});

var options = {
  uri: 'http://mca-central.herokuapp.com/temperatureData',
  method: 'POST',
  json: array
};
