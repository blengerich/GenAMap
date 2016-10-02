var fs = require('fs')
var path = require('path')

const projectname = 'TCGA-OV'

var maximum = 0

const folderPath = path.join('../data', projectname)
const FPKMPath = path.join(folderPath, 'FPKM')

const lost_fullPath = path.join(folderPath, 'lost.csv')
const caseid_fullPath = path.join(folderPath, 'case_id.csv')
var caseid_File = fs.readFileSync(caseid_fullPath, 'UTF8')
caseid_File.split(/\r?\n/).forEach(function (line) {
  maximum = maximum + 1
})
console.log(maximum)

for(var i = 0; i < maximum; i++){
    var caseid = i + 1
    var filename = path.join(FPKMPath, 'FPKM_'+caseid+'.csv')
    if (!fs.existsSync(filename)) {
      var lostStream = fs.createWriteStream(lost_fullPath, {'flags':'a'})
      lostStream.write(caseid+'\n')
      lostStream.end()
    }
}
