//sample run instructions: node --max_old_space_size=6000 translate.js alz.bed snps.map output.csv

const fs = require('fs')

function getByteString(n) {
  if (n < 0 || n > 255 || n % 1 !== 0) {
      throw new Error(n + " does not fit in a byte")
  }
  return ("000000000" + n.toString(2)).substr(-8)
}

function translateByteString(s) {
    let output = ''
    let s1 = s.substr(0, 2)
    let s2 = s.substr(2, 2)
    let s3 = s.substr(4, 2)
    let s4 = s.substr(6, 2)
    output += decode(s4)
    output += decode(s3)
    output += decode(s2)
    output += decode(s1)
    return output
}

function decode(s) {
    switch (s) {
        case '00':
        case '01': 
            return '0'
            break
        case '10': 
            return '1'
            break
        case '11':
            return '2'
            break
    }
}

function translate(inputFilename, n, outputFilename) {
    const rr = fs.createReadStream(inputFilename)
    const matrix = []
    n/=4 //where n is the number of items per column
    let counter = 0

    rr.on('readable', () => {
      //clear first 3 bytes
      let byte
      while (null !== (byte = rr.read(1))) {
        counter++
        if (counter % 1000000 === 0) console.log(counter/1000000 + 'mb read')
        if (counter < 3) continue
        let translatedString = translateByteString(getByteString(byte[0]))
        // console.log(`${getByteString(byte[0])} is translated to ${translatedString}`)
        
        //save it to the matrix
        if (counter-3 < n) {
            //fill up the first index of each row first (first column)
            matrix.push([translatedString.charAt(0)])
            matrix.push([translatedString.charAt(1)])
            matrix.push([translatedString.charAt(2)])
            matrix.push([translatedString.charAt(3)])
        } else {
            matrix[Math.floor((counter-3)%n)*4].push(translatedString.charAt(0))
            matrix[Math.floor((counter-3)%n)*4+1].push(translatedString.charAt(1))
            matrix[Math.floor((counter-3)%n)*4+2].push(translatedString.charAt(2))
            matrix[Math.floor((counter-3)%n)*4+3].push(translatedString.charAt(3))
        }
      }
    })

    rr.on('end', () => {
        console.log(`Writing ${matrix.length}x${matrix[0].length} matrix`)
        write2dArrayToCSV(matrix, outputFilename)
    })

}

function write2dArrayToCSV(matrix, outputFilename) {
    for (let i = 0; i < matrix.length; i++) {
        let line = ''
        let r = matrix[i]
        for (let j = 0; j < r.length; j++) {
            line += r[j]
            if (j < r.length - 1) {
                line += ','
            }
        }
        line += '\n'
        fs.appendFileSync(outputFilename, line, 'utf8')
    }
    console.log('write complete!')
}

function getN(mapFilename) {
    console.log(`Reading ${mapFilename} to get value of n...`)
    const contents = fs.readFileSync(mapFilename, 'utf8')
    return contents.split('\n').length - 1 //dont count the last newline
}


function main() {
    let inputFilename = process.argv[2]
    let mapFilename = process.argv[3]
    let outputFilename = process.argv[4]
    if (!inputFilename || !outputFilename || !mapFilename) {
        console.log('Usage:\t node translate.js <.bed file> <.map file> <output>')
        return
    }

    console.log(`Translating ${inputFilename} and write to ${outputFilename}...`)
    let n = getN(mapFilename)
    console.log(`n=${n}`)
    translate(inputFilename, n, outputFilename)
}

main()
