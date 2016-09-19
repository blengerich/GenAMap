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
const maximum = 150

const folderPath = path.join('../data', projectname)
const FPKMval_fullPath = path.join(folderPath, 'FPKM.csv')
const FPKMUQval_fullPath = path.join(folderPath, 'FPKMUQ.csv')
const htseqval_fullPath = path.join(folderPath, 'htseq.csv')
const markerLabel_fullPath = path.join(folderPath, 'markerLabel.csv')

const caseid_fullPath = path.join(folderPath, 'case_id.csv')
const FPKM_fullPath = path.join(folderPath, 'FPKM_list.csv')
const FPKMUQ_fullPath = path.join(folderPath, 'FPKM_UQ_list.csv')
const htseq_fullPath = path.join(folderPath, 'htseq_list.csv')

const FPKMPath = path.join(folderPath, 'FPKM')
const FPKMUQPath = path.join(folderPath, 'FPKMUQ')
const htseqPath = path.join(folderPath, 'htseq')
var FPKM_index = 1
var FPKMUQ_index = 1
var htseq_index = 1

FPKMDataCompose(FPKM_index)
FPKMUQDataCompose(FPKMUQ_index)
htseqDataCompose(htseq_index)
markerLabelCompose()

function FPKMDataCompose(caseid){
  var filename = path.join(FPKMPath, 'FPKM_'+caseid+'.csv')
  var lineReader = readline.createInterface({input: fs.createReadStream(filename)})
  var snp = []
  console.log(caseid)
  lineReader.on('line', (line) => {
    snp.push(line.split('\t')[1])
  })
  lineReader.on('close',()=>{
    var markerValueStream = fs.createWriteStream(FPKMval_fullPath, {'flags':'a'})
    markerValueStream.write(snp+'\n')
    markerValueStream.end()
    markerValueStream.on('finish', function(){
      caseid = caseid + 1
      if(caseid <= maximum){FPKMDataCompose(caseid)}
      else{console.log('FPKM DONE')}
    })
    })
}

function FPKMUQDataCompose(caseid){
  var filename = path.join(FPKMUQPath, 'FPKMUQ_'+caseid+'.csv')
  var lineReader = readline.createInterface({input: fs.createReadStream(filename)})
  var snp = []
  console.log(caseid)
  lineReader.on('line', (line) => {
    snp.push(line.split('\t')[1])
  })
  lineReader.on('close',()=>{
    var markerValueStream = fs.createWriteStream(FPKMUQval_fullPath, {'flags':'a'})
    markerValueStream.write(snp+'\n')
    markerValueStream.end()
    markerValueStream.on('finish', function(){
      caseid = caseid + 1
      if(caseid <= maximum){FPKMUQDataCompose(caseid)}
      else{console.log('FPKM_UQ DONE')}
    })
    })
}

function htseqDataCompose(caseid){
  var filename = path.join(htseqPath, 'htseq_'+caseid+'.csv')
  var lineReader = readline.createInterface({input: fs.createReadStream(filename)})
  var snp = []
  console.log(caseid)
  lineReader.on('line', (line) => {
    snp.push(line.split('\t')[1])
  })
  lineReader.on('close',()=>{
    var markerValueStream = fs.createWriteStream(htseqval_fullPath, {'flags':'a'})
    markerValueStream.write(snp+'\n')
    markerValueStream.end()
    markerValueStream.on('finish', function(){
      caseid = caseid + 1
      if(caseid <= maximum){htseqDataCompose(caseid)}
      else{console.log('htseq DONE')}
    })
    })
}

function markerLabelCompose(){
  var filename = path.join(FPKMPath, 'FPKM_1.csv')
  var lineReader = readline.createInterface({input: fs.createReadStream(filename)})
  var snp = []
  var markerValueStream = fs.createWriteStream(markerLabel_fullPath, {'flags':'a'})
  lineReader.on('line', (line) => {
    markerValueStream.write(line.split('\t')[0]+'\n')
  })
  lineReader.on('close',()=>{
    markerValueStream.end()
  })
}
