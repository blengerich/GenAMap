var request = require('request')
var fs = require('fs')
var http = require('http')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var mkdirp = require('mkdirp')
var zlib = require('zlib')
var path = require('path')
var readline = require('readline')
var async = require('async')

const projectname = 'TCGA-TGCT'

const folderPath = path.join('../data', projectname)
mkdirp.sync(folderPath)

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

var FPKM_text = fs.readFileSync(FPKM_fullPath, 'UTF8')
var FPKM_list = []
FPKM_text.split(/\r?\n/).forEach(function (line) {
  FPKM_list.push(line)
})
var FPKMUQ_text = fs.readFileSync(FPKMUQ_fullPath, 'UTF8')
var FPKMUQ_list = []
FPKMUQ_text.split(/\r?\n/).forEach(function (line) {
  FPKMUQ_list.push(line)
})
var htseq_text = fs.readFileSync(htseq_fullPath, 'UTF8')
var htseq_list = []
htseq_text.split(/\r?\n/).forEach(function (line) {
  htseq_list.push(line)
})

// var FPKM_index = 0
var FPKMUQ_index = 0
// var htseq_index = 0

// FPKMDownload(FPKM_list[FPKM_index])
FPKMUQDownload(FPKMUQ_list[FPKMUQ_index])
// htseqDownload(htseq_list[htseq_index])

function FPKMDownload(line){
    const FPKMPath = path.join(folderPath, 'FPKM')
    mkdirp.sync(FPKMPath)
    const UUID = line.split(' ')[1]
    const caseid = line.split(' ')[0]
    const filepath = path.join(FPKMPath, 'FPKM_'+caseid+'.csv')
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    try{
    client.open("GET", link , true)
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        try{
          var markerStream = fs.createWriteStream(filepath, {'flags':'w'})
          var stream = request(link).pipe(zlib.createGunzip()).pipe(markerStream)
          stream.on('finish', function() {
              markerStream.end()
              FPKM_index = FPKM_index + 1
              console.log('FPKM_'+FPKM_index)
              if(FPKM_index < FPKM_list.length){FPKMDownload(FPKM_list[FPKM_index])}
          })
        }
        catch(err){
          console.log(err)
          if(FPKM_index < FPKM_list.length){FPKMDownload(FPKM_list[FPKM_index])}
        }
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
    client.ontimeout = function(){
      if(FPKM_index < FPKM_list.length){
        FPKMDownload(FPKM_list[FPKM_index])
      }}
    }catch(err){
      console.log(err)
      console.log('...')
      FPKMDownload(FPKM_list[FPKM_index])
    }
}

function FPKMUQDownload(line){
    const FPKMUQPath = path.join(folderPath, 'FPKMUQ')
    mkdirp.sync(FPKMUQPath)
    const UUID = line.split(' ')[1]
    const caseid = line.split(' ')[0]
    const filepath = path.join(FPKMUQPath, 'FPKMUQ_'+caseid+'.csv')
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    try{
    client.open("GET", link , true)
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        try{
          var markerStream = fs.createWriteStream(filepath, {'flags':'w'})
          var stream = request(link).pipe(zlib.createGunzip()).pipe(markerStream)
          stream.on('finish', function() {
              markerStream.end()
              FPKMUQ_index = FPKMUQ_index + 1
              console.log('FPKMUQ_'+FPKMUQ_index)
              if(FPKMUQ_index < FPKMUQ_list.length){FPKMUQDownload(FPKMUQ_list[FPKMUQ_index])}
          })
        }
        catch(err){
          console.log(err)
          if(FPKMUQ_index < FPKMUQ_list.length){FPKMUQDownload(FPKMUQ_list[FPKMUQ_index])}
        }
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
    client.ontimeout = function(){
      if(FPKMUQ_index < FPKMUQ_list.length){
        FPKMUQDownload(FPKMUQ_list[FPKMUQ_index])
      }}
    }catch(err){
      console.log(err)
      console.log('...')
      FPKMUQDownload(FPKMUQ_list[FPKMUQ_index])
    }

}

function htseqDownload(line){
    const htseqPath = path.join(folderPath, 'htseq')
    mkdirp.sync(htseqPath)
    const UUID = line.split(' ')[1]
    const caseid = line.split(' ')[0]
    const filepath = path.join(htseqPath, 'htseq_'+caseid+'.csv')
    var options = null
    var link = 'https://gdc-api.nci.nih.gov/data/' + UUID
    var suffix
    var filename
    var client = new XMLHttpRequest()
    try{
    client.open("GET", link , true)
    client.send()
    client.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        try{
          var markerStream = fs.createWriteStream(filepath, {'flags':'w'})
          var stream = request(link).pipe(zlib.createGunzip()).pipe(markerStream)
          stream.on('finish', function() {
              markerStream.end()
              htseq_index = htseq_index + 1
              console.log('htseq_'+htseq_index)
              if(htseq_index < htseq_list.length){htseqDownload(htseq_list[htseq_index])}
          })
        }
        catch(err){
          console.log(err)
          if(htseq_index < htseq_list.length){htseqDownload(htseq_list[htseq_index])}
        }
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
    client.ontimeout = function(){
      if(htseq_index < htseq_list.length){
        htseqDownload(htseq_list[htseq_index])
      }}
    }catch(err){
      console.log(err)
      console.log('...')
      htseqDownload(htseq_list[htseq_index])
    }

}
