var request = require('request')
var fs = require('fs')
var http = require('http')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var mkdirp = require('mkdirp')
var zlib = require('zlib')
var path = require('path')
var readline = require('readline')
var async = require('async')

const projectname = 'TCGA-LUAD'

const folderPath = path.join('../data', projectname)

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

const caseid_fullPath = path.join(folderPath, 'case_id.csv')
const FPKM_fullPath = path.join(folderPath, 'FPKM_list.csv')
const FPKMUQ_fullPath = path.join(folderPath, 'FPKM_UQ_list.csv')
const htseq_fullPath = path.join(folderPath, 'htseq_list.csv')

getCaseID(projectname, folderPath)


function getCaseID(disease_id, folderPath){
    var filt = encodeURIComponent('{"op" : "in" , "content" : {"field" : "cases.project.project_id" ,"value" : ["'+ disease_id +'"]}}')
    var url = 'https://gdc-api.nci.nih.gov/cases?filters='+ filt + '&size=65536'
    var index = 1
    mkdirp.sync(folderPath)
    request(url, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var regcase = /\"case_id\": \"(.+?)\"/ig
      async.whilst(
          function () { return foundcaseid = regcase.exec(body) },
          function (callback) {
              var case_id = foundcaseid[0].split('"')[3]
              var caseidStream = fs.createWriteStream(caseid_fullPath, {'flags':'a'})
              caseidStream.write(index + ' ' + case_id + '\n')
              caseidStream.end()
              getUUID(case_id, index)
              getphenotype(case_id, traitval_fullPath, index)
              index++
              regcase.lastIndex -= foundcaseid[0].split(':')[1].length
              callback()
          },
          function (err, n) {
            console.log(err)
          }
      )
    }
  })
}

function getUUID(case_id, index){
    var filt = encodeURIComponent('{"op":"and","content":[{"op": "=", "content": {"field": "cases.case_id","value": ["'+ case_id +'"]}},{"op": "=", "content":{"field": "access","value": ["open"]}},{"op": "=", "content":{"field": "data_type","value": ["Gene Expression Quantification"]}}]}')
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
          switch(FPKM_type){
            case 'FPKM':
              var FPKMStream = fs.createWriteStream(FPKM_fullPath, {'flags':'a'})
              FPKMStream.write(index + ' ' + UUID + '\n')
              FPKMStream.end()
              break
            case 'FPKM-UQ':
              var FPKMUQStream = fs.createWriteStream(FPKMUQ_fullPath, {'flags':'a'})
              FPKMUQStream.write(index + ' ' + UUID + '\n')
              FPKMUQStream.end()
              break
            case 'htseq':
              var htseqStream = fs.createWriteStream(htseq_fullPath, {'flags':'a'})
              htseqStream.write(index + ' ' + UUID + '\n')
              htseqStream.end()
              break
            }
          regfile.lastIndex -= foundfile[0].split(':')[1].length
        }
    }
    else{console.log('Unable to connect')}
    })
}

function getphenotype(case_id, filename, index){
    var url = 'https://gdc-api.nci.nih.gov/cases/'+ case_id + '?expand=demographic,diagnoses'
    request(url, function(error, response, body){
        var pheno = ''
        if (!error && response.statusCode == 200) {
          var regcase = /\"site_of_resection_or_biopsy\": \"(.+?)\"/ig
          var reggender = /\"gender\": \"(.+?)\"/ig
          var reggender = /\"race\": \"(.+?)\"/ig
          while(foundpheno = regcase.exec(body)){
            pheno = foundpheno[0].split('"')[3]
            regcase.lastIndex -= foundpheno[0].split(':')[1].length
          }
        }
        var traitValStream = fs.createWriteStream(filename, {'flags':'a'})
        pheno = pheno.split('c')[1]
        // console.log(pheno)
        traitValStream.write(index + ' ' + pheno + '\n')
        traitValStream.end()
    })
}
