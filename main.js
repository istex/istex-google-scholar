const fs = require('fs');
const spawnSync = require('child_process').spawnSync;
const JSSelect = require('js-select');
const requestModule = require('request');
const proxyOpts = (process.env['http_proxy']) ? {proxy:process.env['http_proxy'],timeout:20000} : {timeout:20000};
const request = requestModule.defaults(proxyOpts);
const each = require('async/each');
const path = require('path');

const kbartRelativePath = "resources/kbart/";

// the url where the Google Scholar xml files will put exposed on the internet
const url = 'https://content-delivery.istex.fr/google-scholar';

// the path to the style sheet for transforming Kbart XML files
const pathKbart2gs = 'resources/xslt/Kbart2gs.xsl';

// the external XSTL engine to be called
const xsltEngine = 'xsltproc';

// the list of kbart "collections" to be generated as Google XML holding, expressed with their kbart name
const toBeGenerated = [
  'ELSEVIER_FRANCE_ISTEXJOURNALS',
  'SPRINGER_FRANCE_ISTEXJOURNALS',
  'WILEY_FRANCE_ISTEXJOURNALS',
  'SAGE_FRANCE_ISTEXJOURNALS',
  'OUP_FRANCE_ISTEXJOURNALS',
  'BMJ_FRANCE_ISTEXJOURNALS',
  'IOP_FRANCE_ISTEXJOURNALS',
  'NPG_FRANCE_ISTEXJOURNALS',
  'DEGRUYTER_FRANCE_ISTEXJOURNALS',
  'EMERALD_FRANCE_ISTEXJOURNALS',
  'BRILL_FRANCE_ISTEXJOURNALS',
  'RSC_FRANCE_ISTEXJOURNALS',
  'RSC_FRANCE_ISTEXEBOOKS',
  'CUP_FRANCE_ISTEXJOURNALS',
  'EDPSCIENCES_FRANCE_ISTEXJOURNALS'
  ];

// parameters for getting the description of one package from BACON REST service (in XML)
var packageGet = {
    host : 'bacon.abes.fr',
    port : 80,
    path : '/package2kbart/',
	// path parameter must be completed with the name of the package (without date indication for the latest one)
    method : 'GET'
};

function generateGoogleScholarFiles(gsFilesPath, kbartPath, outDir) {
  console.log("Generating Google Scholar description files");
  
  var istexPackages = [];
  // first get the list of BACON package names via bacon.abes.fr/list.json
  
  console.log("Getting ISTEX packages via BACON service");
  // we use the BACON service filter parameters for getting only the ISTEX package names
  const baconUrl = 'http://bacon.abes.fr/filter/providerid=0&standardpackage=0&masterlist=0&labelled=0&istex=1&mixte=1&monograph=1&serial=1';
  request.get(baconUrl, function (error, response, body) {

    if (response && (response.statusCode == 200)) {
      // get all the package names containing the string 'ISTEX'
      var responseText = response.body.toString();
      var json = JSON.parse(responseText);
      var nodes = JSSelect(json, ".bacon .package_id").nodes();
      for(var node in nodes) {
        addISTEXPackage(nodes[node], istexPackages);
      }
    } else {
      console.error('Error code ' + response.statusCode);
      process.exit(1);
    }
  
    // get the Kbart files for the ISTEX packages via bacon.abes.fr/package2kbart/
    console.log("istex packages : ",istexPackages);
    
    // update the local kbart files based on the list of istex names
    each(istexPackages, updateISTEXKbartPackage, function(err) {
      if (err) {
        console.log("erreur lors de la MAJ des packages ABES:",err);
        return(err);
      }

      // list of generated Google files
      var holdingFiles = [];
  
      // for each Kbart file in xml to be generated into Google XML format, apply the gs style sheet
      for (var i = 0, len = toBeGenerated.length; i < len; i++) {
        // collection name must match with the KBART name
        var collection = toBeGenerated[i];
        var inputPath = kbartPath + collection + '.xml';
        var outHoldingPath = path.join(outDir, "institutional_holdings_" + collection + ".xml");
        var xsltArgs = ['-o', outHoldingPath, pathKbart2gs, inputPath];
        console.log('transforming with external command xsltproc + arguments : ' + xsltArgs);
        
        try {
          var spawnResult = spawnSync(xsltEngine, xsltArgs);
          console.log("File institutional_holdings_"+collection+".xml saved under results/");
        } catch (xsltException) {
          console.error(xsltException);
          return(xsltException);
        }
        
        // // note: a holding file cannot have more than 1 MB of data!
        holdingFiles.push("institutional_holdings_"+collection+".xml");
      }
  
      // write ISTEX institutional_links file which will refer to the previous holding file(s)
      fs.readFile("resources/institutional_links_istex.xml", "utf8", function (err,data) {
        if (err) {
          return console.log(err);
        }
        var replacementString = '<electronic_holdings>\n';
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
      
    });
    
  });
}

function addISTEXPackage(package_id, istexPackages) {
	// we need to remove the trailing date information
	var pos = package_id.indexOf("201");
	if (pos != -1) {
		package_id = package_id.substring(0, pos-1);
		if (istexPackages.indexOf(package_id) == -1)
			istexPackages.push(package_id);
	}
}


function updateISTEXKbartPackage(package_id, updateCallback) {
  var packageUrl = "https://bacon.abes.fr/package2kbart/"+package_id+".xml"
  console.log("packageUrl = ",packageUrl)
  var response = request.get(packageUrl, function(error, response, body) {
    if (response && (response.statusCode == 200)) {
      var responseText = response.body.toString();
      // save locally the delivered XML Kbart file
      try {
        fs.writeFileSync(kbartRelativePath + package_id + ".xml", responseText);
        console.log("Package " + package_id + " successfully updated.");
        return updateCallback();
      } catch (err) {
        console.log("Opps: " + err);
        return updateCallback(err)
      }
    } else return updateCallback(error);
  });
}


generateGoogleScholarFiles('resources/institutional_links_istex.xml', 
	'resources/kbart/', 
	'results/');
