const request = require('sync-request');
const fs = require('fs');
const async = require('async');

const baseOpenURL = 'https://api.istex.fr/document/openurl';

const testPaths = ['resources/test/google-scholar-openurls.txt', 'resources/test/openurls-0.1.txt'];

const green = '\x1b[32m';
const red = '\x1b[31m';
const orange = '\x1b[33m';
const white = '\x1b[37m';
const score = '\x1b[4m';
const reset = '\x1b[0m';

function testOpenURLSet(testFilePaths) {
    var correct = 0;
	var total = 0;
    for (var n in testFilePaths) {
        console.log('Reading ' + testFilePaths[n]);
        fs.readFile(testFilePaths[n], 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            data.split('\n').forEach(function (line) {
                if (line && (line[0] != '#')) {
                    total++;
                    var values = line.split('\t');
                    if ((values.length != 3) && (values.length != 2)) {
                        console.error(red, 'Malformed test line: ' + line);
                        console.error(red, 'Invalid number of tokens: ' + values.length + " tokens");
                    } else {
                        var openURL = values[0];
                        var expectedResult = values[1];
                        var resourceURL = null;
                        if (values.length == 3)
                            resourceURL = values[2];
                        else if (expectedResult == 1) {
                            console.error(red, 'Malformed test line: ' + line);
                            console.error(red, 'Missing expected result as third token');
                            return;
                        }

                        var urlCall = baseOpenURL+openURL+"&noredirect";
                        console.log(white, '\n' + urlCall);
                        try {
                        	var response = request('GET', urlCall, {timeout : 5000});
	                        if (response && (response.statusCode == 200)) {
	                            if (expectedResult == 1) {
		                            // check if returned resource matched with expected one 
                                    var responseText = response.body.toString();
		                            var json = JSON.parse(responseText);
		                            if (json.resourceUrl) {
		                            	var resUrl = json['resourceUrl'];
		                            	var shortBase = baseOpenURL.replace("openurl","").replace("http:", "https:");
		                            	resUrl = resUrl.replace(shortBase,"");
		                            	resUrl = resUrl.replace("/fulltext/pdf","");
                                        resUrl = resUrl.replace("?sid=google","");
		                            	if (resUrl === resourceURL) {
			                            	correct++;
                                            console.log(green, 'True positive / Resource found as expected');
                                        } else {
                                            console.log(red, 'False positive / Resource found but does not match expected one');
                                        }
		                        	}
		                        } else {
                                    console.log(red, 'False positive / A resource is incorreclty found');
                                }
	                        }
	                        else if (response && (response.statusCode == 404)) {
	                        	if (expectedResult == 0) {
		                            correct++;
                                    console.log(green, 'True negative / Resource not found as expected');
                                } else
    	                        	console.log(red, 'False negative / Resource incorrectly not found');
	                        } else {
	                        	console.log(orange, 'Error code ' + response.statusCode);
	                        }
                        } catch(err) {
                        	console.error(err);
                        }
                    }
                }
            });
            console.log(reset, "");
			console.log(score, "correct/total: " + correct+"/"+total + ", " + (100 * correct/total) + "%");  
            console.log(reset, "\n");
        });
    }
}

testOpenURLSet(testPaths);
