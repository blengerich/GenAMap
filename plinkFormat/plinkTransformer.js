// dependence:
var fs = require('fs');

// Usage:
fs.readFile('./fakedata1.ped', 'UTF-8', ped2csv);
fs.readFile('./fakedata1.map', 'UTF-8', map2csv);

// This funciton is to convert the ped data into three csv data:
// traitVal, markerVal, traitLabel
// data is a string, storing data of fakedata1.ped

function ped2csv(err, data) {
  	if (err) {throw err; }
  	result = data.toString();
  	var lines = this.result.split('\n');
  	var traitLabel = 'defaultTrait';

	var traitValStream = fs.createWriteStream('./traitVal.csv', {'flags': 'a'});
	var markerValStream = fs.createWriteStream('./markerVal.csv', {'flags': 'a'});
  	
  	var count = new Array();
  	var genes = lines[0].split(' ');
	if(genes.length <= 2){genes = lines[0].split('\t');}
	for(var i=0 ; i < 6; i++){
		count[i] = new Array();
 		for(var j=0;j < genes.length-6 ; j++){
 			count[i][j] = 0;
 		}
	}
	var linelength = 0;
	var markerValue = new Array();
	var markerVal = new Array();
	for(var i=0 ; i < lines.length; i++){
		if(lines[i]!=null&&lines[i]!=''){
			linelength++;
			markerVal[i] = new Array();
			markerValue[i] = new Array();
		}
	}
	console.log(lines[lines.length-1]);
	console.log(linelength);

  	for(var line = 0; line < linelength; line++){

	  	var values = lines[line].split(' ');
	  	if(values.length <= 2){
	  		values = lines[line].split('\t');
	  	}
	  	if(values.length <=2){
	  		console.log('invalid delimiter1');
	  		break;
	  	}
	    traitValStream.write(values[5]+'\n');

	    for(var i = 0; i < values.length-6; i++){
	    	if(values[i+6] == '-9' || values[i+6] == '0' || values[i+6] == 'N'){count[0][i]++;markerVal[line][i]=0;}
	    	else if(values[i+6] == '1' || values[i+6] == 'A'){count[1][i]++;markerVal[line][i]=1;}
	    	else if(values[i+6] == '2' || values[i+6] == 'T'){count[2][i]++;markerVal[line][i]=2;}
	    	else if(values[i+6] == '3' || values[i+6] == 'G'){count[3][i]++;markerVal[line][i]=3;}
	    	else if(values[i+6] == '4' || values[i+6] == 'C'){count[4][i]++;markerVal[line][i]=4;}
	    	else{count[5][i]++;markerVal[line][i]=5;}
	    }
	}

	for(var line = 0; line < linelength; line++){
		var snp = 0;
		for(var i = 0; i < genes.length-6; i++){
			var domin = 1;
			for(var j = 2; j < 6; j++){
				if(count[j][i] > count[domin][i]){
					domin = j;
				}
			}
			if (domin == 5){console.log(line +' '+ i + ' invalid marker');}
			if (markerVal[line][i] == domin){markerVal[line][i]=0;}
			else{markerVal[line][i]=1;}
			if(i%2 == 1){
				snp ++;
				markerValue[line][snp] = markerVal[line][i-1] + markerVal[line][i];
			}
		}
		markerValStream.write(markerValue[line].slice(1,markerValue[line].length)+'\n');
	}
	traitValStream.end();
	markerValStream.end();
	fs.writeFile('./traitLabel.csv',traitLabel,function(err){
		if(err){throw err;console.log(err);}
		else{console.log('trait Label done');}
	});
}

// This funciton is to convert the ped data into one csv data:
// markerLabel
// data is a string, storing data of fakedata1.map

function map2csv(err, data){
  	if (err) {throw err; }
  	result = data.toString();
  	var lines = this.result.split('\n');
	var markerLabelStream = fs.createWriteStream('./markerLabel.csv', {'flags': 'a'});
  	
  	for(var line = 0; line < lines.length; line++){
	  	var values = lines[line].split(' ');
	  	if(values.length <= 2){
	  		values = lines[line].split('\t');
	  	}
	  	if(values.length <=2){
	  		console.log('invalid delimiter2');
	  		break;
	  	}
	    markerLabelStream.write(values[1]+'\n');
	}
	markerLabelStream.end();
}
