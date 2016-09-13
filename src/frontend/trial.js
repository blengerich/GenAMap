var request = require('request')
var fs = require('fs')
var http = require('http')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var mkdirp = require('mkdirp')
var zlib = require('zlib')
var path = require('path')
var readline = require('readline')
var Sync = require('sync')

const folderPath = path.join('./.tmp', 'trail')
mkdirp.sync(folderPath)
file_type = "miRNA Expression Quantification"
const id_traitval = 'traitval'
const traitval_fileName = `${id_traitval}.csv`
const traitval_fullPath = path.join(folderPath, traitval_fileName)

const id_traitLabel = 'traitLabel'
const traitLabel_fileName = `${id_traitLabel}.csv`
const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)

const id_markerval = 'markerval'
const markerval_fileName = `${id_markerval}.csv`
const markerval_fullPath = path.join(folderPath, markerval_fileName)

const id_markerLabel = 'markerLabel'
const markerLabel_fileName = `${id_markerLabel}.csv`
const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
// getCaseID('TCGA-CHOL', folderPath, file_type)
getMarkerData('c11fa0ce-0758-464a-a612-46b04141f779', '', markerval_fullPath)
getMarkerLabel('c11fa0ce-0758-464a-a612-46b04141f779', '', markerLabel_fullPath)

function getCaseID(disease_id, folderPath, file_type){

    var filt = encodeURIComponent('{"op" : "in" , "content" : {"field" : "cases.project.project_id" ,"value" : ["'+ disease_id +'"]}}')
    var url = 'https://gdc-api.nci.nih.gov/cases?filters='+ filt + '&size=65535'

    request(url, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var regcase = /\"case_id\": \"(.+?)\"/ig
      var i = 0
      while (foundcaseid = regcase.exec(body)) {
        var case_id = foundcaseid[0].split('"')[3]
        getphenotype(case_id, traitval_fullPath)
        getgenotype(case_id, file_type, folderPath, markerval_fullPath, markerLabel_fullPath)
        regcase.lastIndex -= foundcaseid[0].split(':')[1].length
      }
    }

    var traitLabelStream = fs.createWriteStream(traitLabel_fullPath, {'flags':'a'})
    traitLabelStream.write(disease_id + '\n')
    traitLabelStream.end()
    })
}

function getgenotype(case_id, file_type, folderPath, markerval_fullPath, markerLabel_fullPath){
    var filt = encodeURIComponent('{"op":"and","content":[{"op": "=", "content": {"field": "cases.case_id","value": ["'+ case_id +'"]}},{"op": "=", "content":{"field": "access","value": ["open"]}},{"op": "=", "content":{"field": "data_type","value": ["'+ file_type +'"]}}]}')
    var url = 'https://gdc-api.nci.nih.gov/files?filters='+ filt + '&size=65535'
    console.log(url)
    request(url, function(error, response, body){
    var UUID = ''
    if (!error && response.statusCode == 200) {
      getMarkerData('77e73cc4-ff31-449e-8e3c-7ae5ce57838c', '', markerval_fullPath)
      getMarkerLabel('77e73cc4-ff31-449e-8e3c-7ae5ce57838c', '', markerLabel_fullPath)

      // var regfile = /\"file_id\": \"(.+?)\"/ig
      // while(foundfile = regfile.exec(body)){
      //     UUID = foundfile[0].split('"')[3]
      //     if (!fs.existsSync(markerLabel_fullPath)){
      //       getMarkerData('b2e7add8-f0b4-4345-befe-57656e97a2b6', '', markerval_fullPath)
      //       getMarkerLabel('b2e7add8-f0b4-4345-befe-57656e97a2b6', '', markerLabel_fullPath)
      //     }
      //   regfile.lastIndex -= foundfile[0].split(':')[1].length
      // }
    }
    else{console.log('Unable to connect')}
    })
}

function getMarkerData(UUID, token, filepath){
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    client.open("GET", link , true)
    if (token != ''){
      client.setRequestHeader('X-Auth-Token', token)
    }
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
          // namelist = client.getResponseHeader("Content-Disposition").split('=')
          // filename = namelist[namelist.length-1]
          // console.log(filename)
          var lineReader = readline.createInterface({
            input: request(link).pipe(zlib.createGunzip())
          })
          var snp = []
          lineReader.on('line', (line) => {
            snp.push(line.split("	")[1])
            console.log(line)
          }).on('close', () => {
            var markerValStream = fs.createWriteStream(filepath, {'flags':'a'})
            console.log('downloading')
            markerValStream.write(snp + '\n')
            markerValStream.end()
          })
        }
      else if(client.status == 400){
          console.log('An entity or element of the query was not valid')
      }
      else if(client.status == 403){
          console.log('Unauthorized request')
      }
      else if(client.status == 404){
          console.log('Requested element not found')
      }
    }
}

function getMarkerLabel(UUID, token, filepath){
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    client.open("GET", link , true)
    if (token != ''){
      client.setRequestHeader('X-Auth-Token', token)
    }
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
          var lineReader = readline.createInterface({
            input: request(link).pipe(zlib.createGunzip())
          })
          lineReader.on('line', (line) => {
            var markerLabelStream = fs.createWriteStream(filepath, {'flags':'a'})
            markerLabelStream.write(line.split("	")[0] + '\n')
            markerLabelStream.end()
          })
        }
      else if(client.status == 400){
          console.log('An entity or element of the query was not valid')
      }
      else if(client.status == 403){
          console.log('Unauthorized request')
      }
      else if(client.status == 404){
          console.log('Requested element not found')
      }
    }
}

function getphenotype(case_id, filename){
    var url = 'https://gdc-api.nci.nih.gov/cases/'+ case_id + '?expand=diagnoses'
    request(url, function(error, response, body){
        var pheno = ''
        if (!error && response.statusCode == 200) {
          var regcase = /\"tumor_stage\": \"(.+?)\"/ig
          while(foundpheno = regcase.exec(body)){
            pheno = foundpheno[0].split('"')[3]
            regcase.lastIndex -= foundpheno[0].split(':')[1].length
          }
        }
        var traitValStream = fs.createWriteStream(filename, {'flags':'a'})
        switch(pheno.split(' ')[0]){
          case 'stage':
            pheno = 1
            break
          default:
            pheno = 0
        }
        // console.log(pheno)
        traitValStream.write(pheno + '\n')
        traitValStream.end()
    })
}
