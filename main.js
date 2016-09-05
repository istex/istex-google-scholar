const request = require('request');
const fs = require('fs');
const exec = require('child_process').exec;

// the url where the Google Scholar xml files will put exposed on the internet
const url = '';

// the path to the style sheet for transforming Kbart XML files
const pathKbart2gs = 'resources/xslt/Kbart2gs.xsl';

// the external XSTL engine to be called
const xsltEngine = 'xsltproc';

// parameters for getting the description of one package from BACON REST service (in XML)
var packageGet = {
    host : 'bacon.abes.fr', 
    port : 80,
    path : '/package2kbart/', 
	// path parameter must be completed with the name of the package (without date indication for the latest one) 
    method : 'GET' 
};

function generateGoogleScholarFiles(gsFilesPath, kbartPath, outPath) {
	console.log("Generating Google Scholar description files");
	
    var istexPackages = [];
	// first get the list of BACON package names via bacon.abes.fr/list.json
    request('http://bacon.abes.fr/list.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            // get all the package names containing the string 'ISTEX'

        }
    });

    // get the Kbart files for the ISTEX packages via bacon.abes.fr/package2kbart/

	
	// for each Kbart file in xml, apply the gs style sheet 
	var filename = kbartPath + 'ELSEVIER_FRANCE_ISTEXJOURNALS.xml';
	var transformedString; // = xslt.transform(styleSheetDoc, theDocument, []);
    var command = xsltEngine + ' ' + pathKbart2gs + ' ' + filename;
    console.log('transforming with external command: ' + command);
    exec(command, {maxBuffer: 1024 * 1000}, function (error, stdout, stderr) {
       if (stderr) {
           console.error(stderr);
       }
       if (error) {
           console.error(error);
       }
       fs.writeFile("results/institutional_holdings_istex_elsevier.xml", stdout, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("File institutional_holdings_istex.xml saved under results/");
        });
   });

	// note: a holding file cannot have more than 1 MB of data!
	var holdingFiles = ['institutional_holdings_istex_elsevier.xml'];
	
	// write institutional_links file which will refer to the previous holding file(s)
	fs.readFile('resources/institutional_links_istex.xml', 'utf8', function (err,data) {
	  	if (err) {
	    	return console.log(err);
	  	}
		var replacementString = '\t<electronic_holdings>\n';
		for(var holdingFile in holdingFiles) {
			replacementString += '\t\t<url>' + url + '/' + holdingFiles[holdingFile] + '</url>\n';
		}
		replacementString += '\t</electronic_holdings>';
	  	data = data.replace("<electronic_holdings/>", replacementString);
		fs.writeFile("results/institutional_links_istex.xml", data, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("File institutional_links_istex.xml saved under results/");
		});
	});
}

generateGoogleScholarFiles('resources/institutional_links_istex.xml', 
	'resources/kbart/', 
	'results/');
