/*
 * loadData.js
 * File with formal logic that 
 * Loads CSV data to db or deletes collections in db
 */

var fs = require('fs');
var readline = require('readline')
var Data = require('../model/dataModel');
var SNP = require('../model/snpModel');
var through = require('through2')
var stream = require('stream')

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

/* Function loads CSV (src) into the db */
exports.load = function (src, dst, traits) {
    return new Promise((resolve, reject) => {

        var bulkSNP = [];
        var bulkData = [];


        src.pipe(through(write,end))
        function write (input,enc,cb) {
            //if (!first) {
                // we are bulk inserting arrays of 2000 data points into mongodb
                if (bulkSNP.length == 2000 && bulkData.length == 2000) {
                    // save this bulk of 2000 data points
                    SNP.collection.insert(bulkSNP);
                    Data.collection.insert(bulkData);
                    // start bulk over for next 2000 data points
                    bulkSNP = [];
                    bulkData = [];
                }

                var row = input.toString().split(",").filter(String)
                var chromosome = row[3];
                var bp = parseInt(row[4]);
                var index = genome[chromosome] + bp;
                // TODO: standardize CSV files that are to be loaded
                var newSNP = new SNP({
                    rid: parseInt(row[0]),
                    name: row[1],
                    allels: row[2],
                    chrom: chromosome,
                    basePair: bp,
                    index: index
                });
                
                var newData = new Data({
                    fileName: dst,
                    index: index,
                    data: row.slice(5, row.length).map(parseFloat),
                    traits: traits,
                    zoomLevel: 0 // for now all are at level 0 (TODO: delete if aggregation is good to go)
                });

                // build up the bulk of data
                bulkSNP.push(newSNP);
                bulkData.push(newData);
            //}
            //first = false
            cb()
        }

        function end (cb) {
            // insert remainder bulk
            SNP.collection.insert(bulkSNP);
            Data.collection.insert(bulkData);
            // create index for SNP and Data collections
            SNP.collection.createIndex({basePair: "1"});
            Data.collection.createIndex({index: "1"});
            resolve("Data loaded!");
            cb()
        }
    });
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