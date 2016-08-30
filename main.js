var https = require('https');
var xslt = require('node_xslt');
var fs = require('fs');

// the url where the Google Scholar xml files will put exposed on the internet
var url = '';

// parameters for getting the list of all available packages from BACON REST service (in JSON)
var listGet = {
    host : 'bacon.abes.fr', 
    port : 80,
    path : '/list.json', 
    method : 'GET' 
};

// parameters for getting the description of one package from BACON REST service (in XML)
var packageGet = {
    host : 'bacon.abes.fr', 
    port : 80,
    path : '/package2kbart/', 
	// path parameter must be completed with the name of the package (without date indication for the latest one) 
    method : 'GET' 
};

// perform GET request
var reqGet = https.request(listGet, function(res) {
    console.log("statusCode: ", res.statusCode);
    res.on('data', function(d) {
        console.info('GET result:\n');
        process.stdout.write(d);
        console.info('\n\nCall completed');
    });

});

/*reqGet.end();
reqGet.on('error', function(e) {
    console.error(e);
});*/

// apply a stylesheet to an XML file and save the result 
var pathKbart2gs = 'resources/xslt/Kbart2gs.xsl';
var styleSheetDoc = xslt.readXsltFile(pathKbart2gs);

function generateGoogleScholarFiles(gsFilesPath, kbartPath, outPath) {
	console.log("Generating Google Scholar description files");
	
	// normally first get the list of BACON package names via bacon.abes.fr/list.json
	
	// then get all the package names containing the string 'ISTEX'
	
	// then retrieve all the ISTEX Kbart package descriptions in xml format
	
	// for each Kbart file in xml, apply the gs style sheet 
	var filename = kbartPath + 'ELSEVIER_FRANCE_ISTEXJOURNALS.xml';
	console.log('loading ' + filename);
	var theDocument = xslt.readXmlFile(filename);
	console.log('transforming with ' + pathKbart2gs);
	var transformedString = xslt.transform(styleSheetDoc, theDocument, []);
	// note: last parameter is for arguments/values to be given to the style sheet
	fs.writeFile("results/institutional_holdings_istex_elsevier.xml", transformedString, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("File institutional_holdings_istex.xml saved under results/");
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
