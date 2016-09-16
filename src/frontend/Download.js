var request = require('request')
var fs = require('fs')
var http = require('http')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var mkdirp = require('mkdirp')
var zlib = require('zlib')
var path = require('path')
var readline = require('readline')
var async = require('async')

const folderPath = path.join('./GDCdata', 'TCGA-TGCT')

const file_type = "Gene Expression Quantification"
const id_traitval = 'traitval'
const traitval_fileName = `${id_traitval}.csv`
const traitval_fullPath = path.join(folderPath, traitval_fileName)

const id_traitLabel = 'traitLabel'
const traitLabel_fileName = `${id_traitLabel}.csv`
const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)

// const id_markerval = 'markerval'
// const markerval_fileName = `${id_markerval}.csv`
// const markerval_fullPath = path.join(folderPath, markerval_fileName)
//
const id_markerLabel = 'markerLabel'
const markerLabel_fileName = `${id_markerLabel}.csv`
const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
getCaseID('TCGA-TGCT', folderPath, file_type)
// getMarkerData('c11fa0ce-0758-464a-a612-46b04141f779', './GDCdata.csv')
// getMarkerLabel('c11fa0ce-0758-464a-a612-46b04141f779', '', markerLabel_fullPath)

function getCaseID(disease_id, folderPath, file_type){
    var filt = encodeURIComponent('{"op" : "in" , "content" : {"field" : "cases.project.project_id" ,"value" : ["'+ disease_id +'"]}}')
    var url = 'https://gdc-api.nci.nih.gov/cases?filters='+ filt + '&size=65536'
    mkdirp.sync(folderPath)
    request(url, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var regcase = /\"case_id\": \"(.+?)\"/ig
      var i = 0 // this is file id
      async.whilst(
          function () { return foundcaseid = regcase.exec(body) },
          function (callback) {
              var case_id = foundcaseid[0].split('"')[3]
              getphenotype(case_id, traitval_fullPath)
              getgenotype(case_id, file_type, folderPath, i)
              regcase.lastIndex -= foundcaseid[0].split(':')[1].length
              i = i + 1
              console.log(i)
              callback()
            },
          function (err, n) {
            console.log('downloading Failed')
          }
      )
      // while(foundcaseid = regcase.exec(body)){
      //   var case_id = foundcaseid[0].split('"')[3]
      //   getphenotype(case_id, traitval_fullPath)
      //   getgenotype(case_id, file_type, folderPath, i)
      //   regcase.lastIndex -= foundcaseid[0].split(':')[1].length
      //   i = i + 1
      //   callback()
      //   console.log(i)
      // }




    }
  })

    var traitLabelStream = fs.createWriteStream(traitLabel_fullPath, {'flags':'a'})
    traitLabelStream.write('tumor_stage' + '\n')
    // traitLabelStream.write('gender' + '\n')
    // traitLabelStream.write('race' + '\n')
    traitLabelStream.end()
  }


function getgenotype(case_id, file_type, folderPath, i){
    var filt = encodeURIComponent('{"op":"and","content":[{"op": "=", "content": {"field": "cases.case_id","value": ["'+ case_id +'"]}},{"op": "=", "content":{"field": "access","value": ["open"]}},{"op": "=", "content":{"field": "data_type","value": ["'+ file_type +'"]}}]}')
    var url = 'https://gdc-api.nci.nih.gov/files?filters='+ filt + '&size=65535'
    // console.log(url)
    request(url, function(error, response, body){
    var UUID = ''
    if (!error && response.statusCode == 200) {
      var regfile = /\"file_id\": \"(.+?)\"/ig
      var regfilename = /\"file_name\": \"(.+?)\"/ig
      while(foundfile = regfile.exec(body) ){
          foundfilename = regfilename.exec(body)
          UUID = foundfile[0].split('"')[3]
          FPKM_type = foundfilename[0].split('"')[3].split('.')[1]
          dirname = path.join(folderPath, FPKM_type)
          mkdirp.sync(dirname)
          filename = path.join(dirname , FPKM_type + i.toString() + '.csv')
          console.log(filename)
          getMarkerData(UUID, filename)
          if (!fs.existsSync(markerLabel_fullPath)){
            getMarkerLabel(UUID, markerLabel_fullPath)
          }
          regfile.lastIndex -= foundfile[0].split(':')[1].length
        }
    }
    else{console.log('Unable to connect')}
    })
}

function getMarkerData(UUID, filepath){
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    client.open("GET", link , true)
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var markerStream = fs.createWriteStream(filepath, {'flags':'a'})
        request(link).pipe(zlib.createGunzip()).pipe(markerStream)
        markerStream.end()
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

function getMarkerLabel(UUID, filepath){
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    client.open("GET", link , true)
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
    var url = 'https://gdc-api.nci.nih.gov/cases/'+ case_id + '?expand=demographic,diagnoses'
    request(url, function(error, response, body){
        var pheno = ''
        if (!error && response.statusCode == 200) {
          var regcase = /\"tumor_stage\": \"(.+?)\"/ig
          var reggender = /\"gender\": \"(.+?)\"/ig
          var reggender = /\"race\": \"(.+?)\"/ig
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
