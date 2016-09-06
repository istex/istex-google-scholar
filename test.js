const request = require('sync-request');
const fs = require('fs');
const async = require('async');

const baseOpenURL = 'https://api-integ.istex.fr/document/openurl';

const testPaths = ['resources/test/google-scholar-openurls.txt', 'resources/test/openurls-0.1.txt'];

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
                        console.error('Malformed test line: ' + line);
                        console.error('Invalid number of tokens: ' + values.length + " tokens");
                    } else {
                        var openURL = values[0];
                        var expectedResult = values[1];
                        var resourceURL = null;
                        if (values.length == 3)
                            resourceURL = values[2];
                        else if (expectedResult == 1) {
                            console.error('Malformed test line: ' + line);
                            console.error('Missing expected result as third token');
                            return;
                        }

                        var urlCall = baseOpenURL+openURL+"&noredirect";
                        console.log('calling: ' + urlCall);
                        try {
                        	var response = request('GET', urlCall, {timeout : 5000});
	                        if (response && (response.statusCode == 200)) {
	                            if (expectedResult == 1) {
		                            // check if returned resource matched with expected one 
                                    var responseText = response.body.toString();
		                            var json = JSON.parse(responseText);
		                            if (json.resourceUrl) {
		                            	var resUrl = json['resourceUrl'];
		                            	var shortBase = baseOpenURL.replace("openurl","").replace("https", "http");
		                            	resUrl = resUrl.replace(shortBase,"");
		                            	resUrl = resUrl.replace("/fulltext/pdf","");
		                            	if (resUrl == resourceURL) {
			                            	correct++;
                                        } else {
                                            console.log('Resource does not match expected one');
                                        }
		                        	}
		                        }
	                        }
	                        else if (response && (response.statusCode == 404)) {
	                        	if (expectedResult == 0)
		                            correct++;
	                        	console.log('Resource not found');
	                        } else {
	                        	console.log('Error code ' + response.statusCode);
	                        }
                        } catch(err) {
                        	console.error(err);
                        }
                    }
                }
            });
			console.log("correct/total: " + correct+"/"+total + ", " + (100 * correct/total) + "%");   
        });
    }
}

testOpenURLSet(testPaths);