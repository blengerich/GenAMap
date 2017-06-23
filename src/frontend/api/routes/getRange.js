/*
 * api.js
 * API to interact with DB
 */

var Data = require('../model/dataModel');
var SNP = require('../model/snpModel');

// perhaps for future use if we define zoom levels
var getZoomFactor = function(zoom) {
    return Math.pow(10, zoom);
}




/*
 * Main API call to query range of results from db
 * arg: start - start index of query (inclusive)
 * arg: end - end index of query (exclusive)
 * arg: factor - factor to aggregate by (0 or 1 yields no aggregation)
 *
 * [example: start = 1000, end = 1500, factor = 100
 *           results in these index aggregations:
 *           [1000-1099, 1100-1199, 1200-1299, 1300-1399, 1400-1499]
 * ]
 */
exports.getRange = function (start, end, factor, fileName) {
    // we ignore values with index 0 since they are incorrect/missing
    if (parseInt(start) == 0) {
        start = 1;
    }
    return new Promise((resolve,reject) => {
        Data.findOne({fileName : fileName}, (err,single) => {


            // no aggregation
            if (factor <= 1) {
                start = 1;
                end = parseInt(end);
                Data.find({
                    fileName : fileName,
                    index: { $gte: start, $lt: end }
                }).exec(function (err, result) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }

                    if (!result || result.length == 0) { // no results
                        resolve([null,single.traits]);
                    } else { // return no-aggregate-query
                        resolve([result,single.traits]);
                    }
                });
            }


            // // aggregate
            // else {
            start = parseInt(start);
            end = parseInt(end);
            factor = parseInt(factor);
            var aggregateResults = [];
            var aggregate = Data.aggregate(
                [
                    // look for documents with index between start and end
                    { "$match": { "fileName" : fileName, "index": {"$gte": start, "$lt": end}}},
                    // for all documents we find, we will unwind the data field to aggregate across documents
                    { "$unwind": { "path": "$data", "includeArrayIndex": "arrayIndex"}},
                    // aggregate max values based on index buckets (dependent on zoom factor) and data index (aridx)
                    { "$group": {
                        "_id": {
                            "idx": {"$floor": {"$divide": ["$index", factor]}},
                            "aridx": "$arrayIndex"
                        },
                        "maxValue": {"$max": "$data"}
                      }
                    },
                    {"$sort": {"_id.aridx": 1}},
                    // aggregate max values for each index bucket
                    { "$group": {
                        "_id": "$_id.idx",
                        "data": { "$push": { "values": "$maxValue"}}}
                    },
                    {"$sort": {"_id": 1}}
                ], function(err, result) { // after query is fetched
                    if (err) {
                        console.error(err);
                        reject(err);
                    }

                    for (var i = 0; i < result.length; i++) { // loop through to format for app.js
                        var obj = new Object();
                        var row = [];
                        var col = result[i];
                        var offset = col._id - (Math.floor(start/factor)); // 0, 1, 2, ... based on $index/factor
                        // generate index range for each aggregate range
                        var startIndex = start + offset * factor;
                        obj.start = (startIndex)
                        obj.end = (startIndex+factor-1)
                        if (obj.end > end) {
                            continue;
                        }

                        // generate array of max data values
                            for (var j = 0; j < col.data.length; j++) {
                                row.push(col.data[j].values);
                            }
                        obj.data = row;

                        // format [{index: rangeOfValues, data:[values]}, {}, ...]
                        aggregateResults.push(obj);
                    }
                    if (!aggregateResults || aggregateResults.length == 0) { // no results
                        resolve([null,single.traits]);
                    } else {
                        resolve([aggregateResults,single.traits]);
                    }
                })
            })
        })
    // }
}

/*
[{data_1}, {data_2}, ...]
*/

/*
 * Return all values for a column (all data for a base pair index)
 * arg: range - array of data objects
 * arg: colIndex - column index to return
 */
exports.getCol = function (range, colIndex) {
    return range[colIndex].data;
}

/*
 * Return all values for a row (data from each base pair index)
 * arg: range - array of data objects
 * arg: rowIndex - row index of the data (should be from 0-27)
 */
exports.getRow = function (range, rowIndex) {
    var row = [];
    for (var i = 0; i < range.length; i++) {
        row.push(range[i].data[rowIndex]);
    }
    return row;
}

/*
 * Return base pair index from data (range) based on data's index (resultIndex)
 * arg: range - array of data objects
 * arg: resultIndex - index of data
 */
exports.getIndex = function (range, resultIndex) {
    return range[resultIndex].index;
}

/*
 * Return length of data values each document has
 * arg: range - array of data objects
 * Should be 28
 */
exports.getRowLength = function (range) {
    return range[0].data.length;
}

/*
 * Return number of documents from our query
 * arg: range - array of data objects
 */
exports.getColLength = function (range) {
    return range.length;
}
