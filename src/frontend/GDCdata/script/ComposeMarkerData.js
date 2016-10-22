var request = require('request')
var fs = require('fs')
var http = require('http')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var mkdirp = require('mkdirp')
var zlib = require('zlib')
var path = require('path')
var readline = require('readline')
var async = require('async')

const projectname = 'TCGA-OV'
const maximum = 609
const freelist = []


const folderPath = path.join('../data', projectname)

const caseid_fullPath = path.join(folderPath, 'case_id.csv')

const lost_fullPath = path.join(folderPath, 'lost.csv')
var lost_File = fs.readFileSync(lost_fullPath, 'UTF8')
lost_File.split(/\r?\n/).forEach(function (line) {
  freelist.push(parseInt(line))
})
console.log(freelist);
console.log(maximum)

const FPKMval_fullPath = path.join(folderPath, 'FPKM.csv')
const FPKMUQval_fullPath = path.join(folderPath, 'FPKMUQ.csv')
const htseqval_fullPath = path.join(folderPath, 'htseq.csv')
const markerLabel_fullPath = path.join(folderPath, 'markerLabel.csv')
const traitLabel_fullPath = path.join(folderPath, 'traitLabel.csv')

const FPKM_fullPath = path.join(folderPath, 'FPKM_list.csv')
const FPKMUQ_fullPath = path.join(folderPath, 'FPKM_UQ_list.csv')
const htseq_fullPath = path.join(folderPath, 'htseq_list.csv')

const FPKMPath = path.join(folderPath, 'FPKM')
const FPKMUQPath = path.join(folderPath, 'FPKMUQ')
const htseqPath = path.join(folderPath, 'htseq')
var FPKM_index = 1
var FPKMUQ_index = 1
var htseq_index = 1

while (freelist.indexOf(FPKM_index) != -1){ FPKM_index = FPKM_index + 1}
while (freelist.indexOf(FPKMUQ_index) != -1){ FPKMUQ_index = FPKMUQ_index + 1}
while (freelist.indexOf(htseq_index) != -1){ htseq_index = htseq_index + 1}

FPKMDataCompose(FPKM_index)
FPKMUQDataCompose(FPKMUQ_index)
htseqDataCompose(htseq_index)
markerLabelCompose()
traitValueCompose()
traitLabelCompose()

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
      while (freelist.indexOf(caseid) != -1){ caseid = caseid+1}
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
      while (freelist.indexOf(caseid) != -1){ caseid = caseid+1}
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
      while (freelist.indexOf(caseid) != -1){ caseid = caseid + 1}
      if(caseid <= maximum){htseqDataCompose(caseid)}
      else{console.log('htseq DONE')}
    })
    })
}

function markerLabelCompose(){
  goodIndex = 1
  while (freelist.indexOf(goodIndex) != -1){ goodIndex = goodIndex + 1}
  var filename = path.join(FPKMPath, 'FPKM_'+goodIndex+'.csv')
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

function traitValueCompose(){
  var filename = path.join(folderPath, 'traitval.csv')
  var newfilename = path.join(folderPath, 'traitValue.csv')
  var lineReader = readline.createInterface({input: fs.createReadStream(filename)})
  var snp = []
  lineReader.on('line', (line) => {
    if (freelist.indexOf(parseInt(line.split(' ')[0])) == -1){
      snp.push({id: line.split(' ')[0] , value: line.split(' ')[1]})
    }
  })
  lineReader.on('close',()=>{
    var result = sortObj(snp, 'id', 'asc')
    var Stream = fs.createWriteStream(newfilename, {'flags':'a'})
    var index = 0
    while (index < result.length){
      Stream.write(result[index]['value']+'\n')
      index++
    }
    Stream.end()
  })
}

function sortObj(arr,key,dir){
	key=key||'id';
	dir=dir||'asc';
	if (arr.length == 0) return [];

	var left = new Array();
	var right = new Array();
	var pivot = parseInt(arr[0][key]);
	var pivotObj = arr[0];

	if(dir==='asc'){
		for (var i = 1; i < arr.length; i++) {
			parseInt(arr[i][key]) < pivot ? left.push(arr[i]): right.push(arr[i]);
		}
	}else{
		for (var i = 1; i < arr.length; i++) {
			parseInt(arr[i][key]) > pivot ? left.push(arr[i]): right.push(arr[i]);
		}
	}
	return sortObj(left,key,dir).concat(pivotObj, sortObj(right,key,dir));
}

function traitLabelCompose(){
  var traitLabelStream = fs.createWriteStream(traitLabel_fullPath, {'flags':'w'})
  traitLabelStream.write('tumour')
  traitLabelStream.end()
}
