/*
 * loadData.js
 * File with formal logic that 
 * Loads CSV data to db or deletes collections in db
 */

var fs = require('fs');
var readline = require('readline')
var Data = require('../model/dataModel');
var SNP = require('../model/snpModel');
var Trait = require('../model/traitModel');
require('es6-promise').polyfill()
var csvtojson = require('csvtojson')

const genome = {
    "1": 0,
    "2": 248956422,
    "3": 491149951,
    "4": 689445510,
    "5": 879660065,
    "6": 1061198324,
    "7": 1232004303,
    "8": 1391350276,
    "9": 1536488912,
    "10": 1674883629,
    "11": 1808681051,
    "12": 1943767673,
    "13": 2077042982,
    "14": 2191407310,
    "15": 2298451028,
    "16": 2400442217,
    "17": 2490780562,
    "18": 2574038003,
    "19": 2654411288,
    "20": 2713028904,
    "21": 2777473071,
    "22": 2824183054,
    "X": 2875001522,
    "Y": 3031042417,
    "M": 3088269832,
    };

exports.loadTrait = function(traitName,dst) {
    return new Promise((resolve,reject) => {
        var trait = new Trait({
            fileName: dst,
            traits: [traitName]
        })
        trait.save(function (err) {
            if (err) {
                reject(err)
            } else {
                resolve('Trait loaded!')
            }
        })
    })
}

exports.loadTraits = function(traits,dst) {
  return new Promise((resolve,reject) => {
    var trait = new Trait({
      fileName: dst,
      traits: traits
    })
    trait.save(function (err) {
      if (err) {
        reject(err)
      } else {
        resolve('Traits loaded!')
      }
    })
  })
}

exports.loadSNPs = function (src) {
    return new Promise((resolve,reject) => {
      const NUM_SNPS = 555091
      var num = 0
      SNP.count({}, (err, c) => {
        if (c < NUM_SNPS) {
          console.log('loading SNPs, this will take a couple minutes')
          var snpdata = fs.createReadStream(src)
          var bulkSNP = []
          csvtojson({delimiter: "\t"})
            .fromStream(snpdata)
            .on('json', (json) => {
              if (bulkSNP.length >= 2000) {
                // save this bulk of 2000 data points
                SNP.insertMany(bulkSNP);
                // start bulk over for next 2000 data points
                bulkSNP = [];
              }
              index = parseInt(genome[json.chrom]) + parseInt(json.base_pair)
              var newSNP = new SNP({
                name: json.marker_name,
                allels: json.marker_alleles,
                chrom: json.chrom,
                basePair: json.base_pair,
                index: index
              });
              bulkSNP.push(newSNP)
            })
            .on('done', () => {
              SNP.insertMany(bulkSNP, () => {
                SNP.collection.createIndex({name: "1"});
                SNP.count({}, (err,c) => {
                  resolve(`${c} snps loaded!`)
                })
              })
            })
        }
        else {
            resolve(`${c} snps already loaded!`)
        }
      })
    })

}

/* Function clears the db */
exports.deleteAll = function() {
    SNP.remove({}, function(){ console.log("removed all SNPs")}).exec();
    Data.remove({}, function(){ console.log("removed all Data")}).exec();
}


// const genome = [
//     {"1": 248956422},
//     {"2": 242193529},
//     {"3": 198295559},
//     {"4": 190214555},
//     {"5": 181538259},
//     {"6": 170805979},
//     {"7": 159345973},
//     {"8": 145138636},
//     {"9": 138394717},
//     {"10": 133797422},
//     {"11": 135086622},
//     {"12": 133275309},
//     {"13": 114364328},
//     {"14": 107043718},
//     {"15": 101991189},
//     {"16": 90338345},
//     {"17": 83257441},
//     {"18": 80373285},
//     {"19": 58617616},
//     {"20": 64444167},
//     {"21": 46709983},
//     {"22": 50818468},
//     {"X": 156040895},
//     {"Y": 57227415},
//     {"M": 16569}
//     ];