var request = require('request');
var fs = require('fs');
var http = require('http');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function projectSearching(){
    // Function Project Searching:
    // Input:
    // None
    // Output:
    // a list of projects. 
    // Aim at providing people with the overview of projects
    // but I can only let them printed out.
    var options = {
        url: 'https://gdc-api.nci.nih.gov/projects?fields=project_id,disease_type&from=1&size=65535&sort=project.project_id:asc&pretty=true'
    };
    request(options, searchcallback);
}

function searchcallback(error, response, body) {
    var matches = [];
    if (!error && response.statusCode == 200) {
        var regpro = /\"project_id\": \"(.+?)\"/ig;
        var regdis = /\"disease_type\": \"(.+?)\"/ig;
        var foundpro, founddis;
        while (foundpro = regpro.exec(body)) {
            founddis = regdis.exec(body);
            matches.push(foundpro[0].split('"')[3]+'('+founddis[0].split('"')[3]+')');
            regpro.lastIndex -= foundpro[0].split(':')[1].length;
            regdis.lastIndex -= founddis[0].split(':')[1].length;
        }
        console.log(matches); 
    }
    // return matches;
    // Question: Undefined return
}

function portalLink(project_id){
    //  Function Portal Linking:
    //  Input:
    //  Project id
    //  Output:
    //  weblink corresponding to the id and lead users go to choose the data.
    var url = "https://gdc-portal.nci.nih.gov/projects/"
    var link = url + project_id
    return link
}

function authorizationCheck(UUID){
    // # Function: authorizationCheck
    // # imput:
    // # UUID --- Universally Unique Identifier for GDC
    // # Output:
    // # True: Have authoriy to download
    // # False: Have no authority to download
    var options = {
        url : 'https://gdc-api.nci.nih.gov/data/' + UUID
    };
    request(options, function(error, response, body){
        console.log(response.statusCode);
    });
    // url = 'https://gdc-api.nci.nih.gov/data/5b2974ad-f932-499b-90a3-93577a9f0573'
}

function Download(UUID, token, filename, path){
    // # Function Download:
    // # Input:
    // # UUID --- Universally Unique Identifier for GDC, which can accurately find the data<
    // # filename --- Giving name to the target file downloaded
    // # path --- local address to store the data
    // # token --- key to the private data
    
    // # url = 'https://gdc-api.nci.nih.gov/data/5b2974ad-f932-499b-90a3-93577a9f0573'
    var options = null;
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID;
    var suffix;
    var client = new XMLHttpRequest();
    client.open("GET", link , true);
    if (token != ''){
        client.setRequestHeader('X-Auth-Token', token);
    }
    client.send();
    console.log(filename);
    client.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            namelist = client.getResponseHeader("Content-Disposition").split('.');
            console.log(namelist);
            if(namelist[namelist.length-1] == 'gz'){suffix = namelist[namelist.length-2] + '.' + namelist[namelist.length-1];}
            else{suffix = namelist[namelist.length-1];}
            console.log(suffix);
            var datapath = path+'/'+ filename + '.'+suffix;
            console.log(datapath);
            downloadFile(link,datapath,function(){
                console.log(filename + ' done');
            });
        }
        else if(client.status == 400){
            console.log('An entity or element of the query was not valid');
        }
        else if(client.status == 403){
            console.log('Unauthorized request');
        }
        else if(client.status == 404){
            console.log('Requested element not found');
        }
    }


}

// Download a file form a url.
function downloadFile(uri,filename,callback){
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
}  

//Download("5b2974ad-f932-499b-90a3-93577a9f0573","",'whatever','./data');
