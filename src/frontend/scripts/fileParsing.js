function parseCSVFile() {
    var newObj = {};
    var selectedFile = document.getElementById('input').files[0];
    if (selectedFile) {
        Papa.parse(selectedFile, {
                    header: true,
                    complete: function(results) {
                        var curArray = results["data"];
                        for (var i = 0; i < curArray.length; i++) {
                            var obj = curArray[i];
                            var innerObj = {};
                            for (var key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    if (key != "Marker") {
                                        innerObj[key] = obj[key];                                     
                                    }
                                }
                            }
                            newObj[obj["Marker"]] = innerObj;
                        }
                        console.log(newObj);
                        return newObj;
                    },
                    error: function(results) {
                        alert("Failed to parse file!");
                    }
        });
    }
    else { 
        alert("File not found!");
    }
}

function parseCSVFileIntoArray() {
    var selectedFile = document.getElementById('input').files[0];
    if (selectedFile) {
        Papa.parse(selectedFile, {
                    header: true,
                    complete: function(results) {
                      var curArray = results["data"];
                      var newArray = [];
                      var traits = [];
                      var markers = [];
                      var correlations = [];
                      //Markers
                      for (var i = 0; i < curArray.length; i++) {
                          var obj = curArray[i];
                          markers.push(obj["Marker"]);
                      }
                      //Traits
                      for (var key in curArray[0]) {
                          if (obj.hasOwnProperty(key)) {
                              traits.push(key)
                          }
                      }
                      traits.shift();
                      for (var i = 0; i < curArray.length; i++) {
                          var obj = curArray[i];
                          for (var j = 0; j < traits.length; j++) {
                            var innerObj = {};
                            innerObj["Marker"] = markers[i];
                            innerObj["Trait"] = traits[j];
                            innerObj["Correlation"] = obj[traits[j]];
                            newArray.push(innerObj);
                          }
                      }
                      console.log(newArray);
                      //downloadCSV(newArray);
                      return {
                        traits: traits,
                        markers: markers,
                        csvFormatted: newArray,
                      };
                    },
                    error: function(results) {
                        alert("Failed to parse file!");
                    }
        });
    }
    else { 
        alert("File not found!");
    }
}


function convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadCSV(args) {  
        var data, filename, link;
        var csv = convertArrayOfObjectsToCSV({
            data: args
        });
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
}