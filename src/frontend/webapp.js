var express = require('express')
var Waterline = require('waterline')
var bodyParser = require('body-parser')
var Busboy = require('busboy')
var fs = require('fs-extra')
var path = require('path')
var expressjwt = require('express-jwt')
var async = require('async')
var omit = require('lodash.omit')
var mkdirp = require('mkdirp')
var csvtojson = require('csvtojson')
var nodemailer = require('nodemailer')
require('es6-promise').polyfill()
require('isomorphic-fetch')
var config = require('./config')
var Scheduler = require('../Scheduler/node/build/Release/scheduler.node')
var jwt = require('jsonwebtoken')
var psqlAdapter = require('sails-postgresql')

// temp
var http = require('http')
var querystring = require('querystring')
//var favicon = require('serve-favicon')
var request = require('request');

/////here is an example

// var file2=[]
// console.log(typeof file2)
// const testFolder = "../../genamap2/data/";
// fs.readdir(testFolder, (err, files) => {
//     files.forEach(file => {
//         console.log(file)
//         file2.push(file)
//         // if(file.indexOf('.csv') != -1){
//         //     console.log("true2")
//         // }
//
//         for(var i_ in file2){
//             console.log(i_)
//             console.log(typeof file2[i_],file2[i_],"--")
//             console.log(typeof i_)
//             if(file2[i_].indexOf('.csv')!=-1){
//                 console.log("true2")
//             }
//         }
//
//         console.log(file2)
//     });
// })


const getTokenContent = (token) => {
    try {
        const decoded = jwt.verify(token, config.secret)
        return decoded
    } catch (error) {
        return
    }
}
const extractFromToken = (token, param) => {
    const tokenContent = getTokenContent(token)
    return tokenContent[param]
}
const createToken = (content) => jwt.sign(content, config.secret, {expiresIn: '5h'})

var app = express()
var orm = new Waterline()

app.engine('.html', require('ejs').renderFile)
app.use(express.static('static'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/api/', expressjwt({secret: config.secret}))
//app.use(favicon(__dirname + '/static/images/favicon.ico'));

const waterlineConfig = {
    adapters: {
        psql: psqlAdapter
    },

    connections: {
        postgres: {
            adapter: 'psql',
            database: 'postgres',
            host: process.env.POSTGRES_PORT_5432_TCP_ADDR,
            port: process.env.POSTGRES_PORT_5432_TCP_PORT,
            user: 'postgres',
            password: config.pg
        }
    },

    defaults: {
        migrate: 'alter'
    }

}

const User = Waterline.Collection.extend({
    identity: 'user',
    tableName: 'genamapuser',
    connection: 'postgres',

    attributes: {
        id: {
            type: 'text',
            primaryKey: true,
            unique: true,
            defaultsTo: function () {
                return guid()
            }
        },
        username: {
            type: 'string',
            required: false
        },
        email: {
            type: 'email',
            required: true
        },
        password: {
            type: 'string',
            required: false
        },
        organization: {
            type: 'string',
            required: false
        },
        toJSON: function () {
            var obj = this.toObject()
            delete obj.password
            return obj
        }
    }
})

const Project = Waterline.Collection.extend({
    tableName: 'project',
    connection: 'postgres',

    attributes: {
        files: {
            collection: 'file',
            via: 'project'
        },
        user: {
            model: 'user'
        },
        species: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            maxLength: 1000,
            required: true
        }
    }
})

const File = Waterline.Collection.extend({
    tableName: 'file',
    connection: 'postgres',

    attributes: {
        path: {
            type: 'string',
            maxLength: 1000,
            required: true
        },
        name: {
            type: 'string',
            maxLength: 1000,
            required: true
        },
        filetype: {
            type: 'string',
            required: true
        },
        user: {
            model: 'user'
        },
        project: {
            model: 'project',
            required: true
        },
        projectItem: {
            type: 'string',
            required: true
        },

        info: {
            type: 'json'
        }
    }
})

const State = Waterline.Collection.extend({
    tableName: 'state',
    connection: 'postgres',

    attributes: {
        state: {
            type: 'string',
            required: true
        },
        user: {
            model: 'user',
            requred: false
        }
    }
})

const TempUser = Waterline.Collection.extend({
    tableName: 'tempuser',
    connection: 'postgres',

    attributes: {
        id: {
            type: 'text',
            primaryKey: true,
            unique: true,
            defaultsTo: function () {
                return guid()
            }
        },
        username: {
            type: 'string',
            required: false
        },
        email: {
            type: 'email',
            required: true
        },
        password: {
            type: 'string',
            required: false
        },
        organization: {
            type: 'string',
            required: false
        },
        toJSON: function () {
            var obj = this.toObject()
            delete obj.password
            return obj
        }
    }
})

orm.loadCollection(User)
orm.loadCollection(Project)
orm.loadCollection(File)
orm.loadCollection(State)
orm.loadCollection(TempUser)

var guid = function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4()
}

var s4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
}

app.post(config.api.createAccountUrl, function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const password2 = req.body.password2
    const organization = req.body.organization
    const initialState = {}

    if (!email || !password) {
        return res.status(400).send({message: 'Missing email or password'})
    }

    if (password !== password2) {
        return res.status(400).send({message: "Passwords don't match"})
    }
    app.models.user.findOne({email}).exec(function (err, foundUser) {
        if (err) console.log(err)
        if (foundUser) {
            return res.status(400).send({message: 'Email already in use'})
        }
        app.models.tempuser.create({email, password, organization}).exec(function (err, createdTempUser) {
            if (err) {
                if (err.code === 'E_VALIDATION')
                    return res.status(400).json({message: 'Invalid email address'})
                return res.status(500).json({err, from: 'createdUser'})
            }
            return res.json(createdTempUser)
        })
    })
})

app.post(config.api.requestUserConfirmUrl, function (req, res) {
    fs.readFile('./static/email/Registration_1.html', function (err, html_1) {
        if (err) {
            throw err
        }
        fs.readFile('./static/email/Registration_2.html', function (err, html_2) {
            if (err) {
                throw err
            }
            var json_file=fs.readFileSync('../../genamap3/Authentication.json')


            var jsonContent = JSON.parse(json_file);
            var transporter = nodemailer.createTransport(jsonContent.user + ':' + jsonContent.password);


            var mailOptions = {
                from: '"GenAMap" <genamap.team@gmail.com>', // sender address
                to: req.body.email,
                subject: 'GenAMap Sign-up Confirmation', // Subject line
                text: 'Registration Confirmation',
                html: html_1
                + 'http://' + config.serverPort + '/#/confirm/'
                + req.body.code + "'>Confirm E-mail</a>"
                + '<br/> Or copy this verification code into the confirmation field: <b><br/>'
                + req.body.code + '</b>'
                + html_2
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                    return res.status(500).send({message: 'Error sending confirmation email to user'})
                }
                console.log('Message sent: ' + info.response);
                return res.json(info.response)
            });
            //});
        })
    })
})

/*
 var transporter = nodemailer.createTransport('smtps://genamap.v2.0@gmail.com:GenAMapV2@smtp.gmail.com');

 var mailOptions = {
 from: '"GenAMap" <genamap.v2.0@gmail.com>', // sender address
 to: req.body.email,
 subject: 'GenAMap Sign-up Comfiration', // Subject line
 text: 'Registration Comfiration',
 html: 'Hi! <br/>'+
 'Thanks for registering for GenAMap. Now you can enjoy visual machine learning software totally free!<br/>'
 + 'Verification code: ' + req.body.code + '<br/>Or confirm at 192.168.99.100:49160/#/confirm/' + req.body.code + '<br/'
 + 'Yours sincerely<br/>' + 'GenAMap Team'
 };*/

app.get(`${config.api.confirmAccountUrl}/:code`, function (req, res) {
    const initialState = {}

    app.models.tempuser.findOne({id: req.params.code}).exec(function (err, foundTempUser) {
        if (err) console.log(err)
        if (!foundTempUser) {
            return res.status(400).send({message: 'Could not verify user: incorrect code'})
        }

        var email = foundTempUser.email
        var password = foundTempUser.password
        var organization = foundTempUser.organization

        app.models.tempuser.destroy({id: req.params.code}).exec(function (err) {
            if (err) console.log(err)

            app.models.user.create({email, password, organization}).exec(function (err, createdUser) {
                if (err) {
                    return res.status(500).json({err, from: 'createdUser'})
                }
                app.models.state.create({
                    state: JSON.stringify(initialState),
                    user: createdUser.id
                }).exec(function (err, createdState) {
                    if (err) return res.status(500).json({err, from: 'createdState'})
                    return res.json({email, password})
                })
            })
        })
    })
})

app.post(config.api.ForgetPasswordUrl, function (req, res) {
    const email = req.body.email
    const initialState = {}

    if (!email) {
        return res.status(400).send({message: 'Missing email'})
    }

    app.models.user.findOne({email}).exec(function (err, foundUser) {
        if (err) console.log(err)
        if (foundUser) {
            return res.json({email})
        }
        else {
            return res.status(400).send({message: 'This account does not exist'})
        }
    })
})

app.post(config.api.ForgetPasswordEmailUrl, function (req, res) {
    var email = req.body.email
    app.models.user.findOne({email}).exec(function (err, foundUser) {
        if (err) console.log(err)
        if (foundUser) {
            fs.readFile('./static/email/Password_1.html', function (err, html_1) {
                if (err) {
                    throw err
                }
                fs.readFile('./static/email/Password_2.html', function (err, html_2) {
                    if (err) {
                        throw err
                    }
                    var password = foundUser.password
                    var auth_details = require('./static/email/Authentication.json');
                    //var transporter = nodemailer.createTransport('smtps://email@gmail.com:pass@smtp.gmail.com');
                    var transporter = nodemailer.createTransport(auth_details.user + ':' + auth_details.pass);
                    var mailOptions = {
                        from: '"GenAMap" <genamap.team@gmail.com>', // sender address
                        to: req.body.email,
                        subject: 'GenAMap Forget Password Email', // Subject line
                        text: 'Forget Password Email',
                        html: html_1 + password + html_2
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error)
                            return res.status(500).send({message: 'Error sending Forget Password email to user'})
                        }
                        console.log('Message sent: ' + info.response);
                        return res.json(info.response)
                    });
                })
            })
        }
        else {
            app.models.tempuser.findOne({email}).exec(function (err, foundTempUser) {
                if (err) console.log(err)
                if (foundTempUser) {
                    fs.readFile('./static/email/Password_1.html', function (err, html_1) {
                        if (err) {
                            throw err
                        }
                        fs.readFile('./static/email/Password_2.html', function (err, html_2) {
                            if (err) {
                                throw err
                            }
                            var password = foundTempUser.password
                            var transporter = nodemailer.createTransport('smtps://genamap.v2.0@gmail.com:GenAMapV2@smtp.gmail.com');
                            var mailOptions = {
                                from: '"GenAMap" <genamap.v2.0@gmail.com>', // sender address
                                to: req.body.email,
                                subject: 'GenAMap Forget Password Email', // Subject line
                                text: 'Forget Password Email',
                                html: html_1 + password + html_2
                            };

                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error)
                                    return res.status(500).send({message: 'Error sending Forget Password email to user'})
                                }
                                console.log('Message sent: ' + info.response);
                                return res.json(info.response)
                            });
                        })
                    })
                }
                else {
                    return res.status(400).send({message: 'This account does not exist'})
                }
            })
        }
    })
})


app.post(config.api.createSessionUrl, function (req, res) {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        return res.status(400).send({message: 'Missing email or password'})
    }

    app.models.user.findOne({email}).exec(function (err, user) {
        if (err) console.log(err)
        if (!user) {
            return res.status(401).send({message: 'Incorrect username or password', user: user})
        }

        if (user.password !== req.body.password) {
            return res.status(401).send({message: 'Incorrect username or password'})
        }

        return res.status(201).send({
            id_token: createToken(omit(user, 'password'))
        })
    })
})

app.post(`${config.api.getActivityUrl}/:id`, function (req, res) {
    const jobId = +req.params.id
    const progress = Scheduler.checkJob(jobId)

    return res.json({progress})
})


app.post(`${config.api.read_filelist}`, function (req, res) {
    var file2=[]
    const testFolder = "../../genamap2/";
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {

            file2.push(file)
        });
    })

    return res.json({file2})
})



app.post(`${config.api.getAnalysisResultsUrl}`, function (req, res) {
    const projectId = req.body.projectId

    function checkFileExists(reqPath) {
        /* check if result file has been written and added to database */
        fs.stat(reqPath, function (err, stats) {
            if (!err) {
                app.models.file.findOne({path: reqPath}, function (err, file) {
                    if (err) {
                        console.log(err)
                    }
                    if (!file) {
                        setTimeout(checkFileExists, 500, reqPath)
                    } else {
                        return res.json({project: projectId, files: [file]})
                    }
                })
            } else if (err.code === 'ENOENT') {
                setTimeout(checkFileExists, 500, reqPath)
            } else {
                console.log(err)
            }
        })
    }

    return checkFileExists(req.body.resultsPath)
})

app.get(`${config.api.dataUrl}/:id`, function (req, res) {
    app.models.file.findOne({id: req.params.id}, function (err, model) {
        if (err) return res.status(500).json({err: err})

        if (!model) return res.status(404).json({message: 'File not found'})

        fs.readFile(model.path, 'utf8', function (error, data) {
            if (error) throw error
            return res.json({file: model, data: data})
        })
    })
})

app.delete(`${config.api.dataUrl}/:id`, function (req, res) {
    app.models.file.findOne({id: req.params.id}).exec(function (err, file) {
        if (err) return res.status(500).json({err: err})
        app.models.file.destroy({id: req.params.id}).exec(function (err) {
            if (err) return res.status(500).json({err: err})
            return res.json({file: file.id, project: file.project, projectItem: file.projectItem})
        })
    })
})


app.post(config.api.importDataUrl, function (req, res) {
    var busboy = new Busboy({headers: req.headers})
    var projectId // eslint-disable-line no-unused-vars
    var projectObj = {}
    var temp_file_name=""
    /*var marker = { files: [] }
     var trait = { files: [] }
     var snpsFeature = { files: [] }
     var population = { files: [] }
     var fileDataList = {*/

    var temp_fieldname=""
    var temp_file=""
    var temp_file2name=""

    var dataList = {
        marker: {
            name: 'Marker Values'
        },
        trait: {
            name: 'Trait Values'
        },
        markerLabel: {
            name: 'Marker Labels'
        },
        traitLabel: {
            name: 'Trait Labels'
        },
        snpsFeature: {
            name: 'SNPs Features'
        },
        population: {
            name: 'Populations'
        }
    }

    var GDCdatainfo = {disease_type: '', datatype: ''}

    const userId = extractUserIdFromHeader(req.headers)

    busboy.on('field', function (fieldname, val, fieldnameTruncated,
                                 valTruncated, encoding, mimetype) {

        if(temp_fieldname!==""){
                temp_file2name=val
            //here if you dont want to use the file read from the filesystem please comment this line
                if (!!temp_file2name) {

                    var folderPath = path.join('./.tmp', userId)
                    mkdirp.sync(folderPath)
                    var ext_name = temp_file2name.split('.')[temp_file2name.split('.').length - 1];
                    if (ext_name == 'ped') {
                        temp_file.on('data', function (data) {
                            result = data.toString()
                            var lines = result.split('\n')
                            var traitLabel = 'defaultTrait'
                            var id_traitval = guid()
                            var traitval_fileName = `${id_traitval}.csv`
                            var traitval_fullPath = path.join(folderPath, traitval_fileName)
                            var traitValStream = fs.createWriteStream(traitval_fullPath, {'flags': 'a'})
                            dataList.trait.filetype = 'traitFile'
                            dataList.trait.path = traitval_fullPath

                            var id_markerval = guid()
                            var markerval_fileName = `${id_markerval}.csv`
                            var markerval_fullPath = path.join(folderPath, markerval_fileName)
                            var markerValStream = fs.createWriteStream(markerval_fullPath, {'flags': 'a'})
                            dataList.marker.filetype = 'markerFile'
                            dataList.marker.path = markerval_fullPath

                            var count = new Array();
                            var genes = lines[0].split(' ');
                            if (genes.length <= 2) {
                                genes = lines[0].split('\t');
                            }
                            for (var i = 0; i < 6; i++) {
                                count[i] = new Array();
                                for (var j = 0; j < genes.length - 6; j++) {
                                    count[i][j] = 0
                                }
                            }
                            var linelength = 0
                            var markerValue = new Array()
                            var markerVal = new Array()
                            for (var i = 0; i < lines.length; i++) {
                                if (lines[i] != null && lines[i] != '') {
                                    linelength++
                                    markerVal[i] = new Array()
                                    markerValue[i] = new Array()
                                }
                            }
                            for (var line = 0; line < linelength; line++) {
                                var values = lines[line].split(' ')
                                if (values.length <= 2) {
                                    values = lines[line].split('\t')
                                }
                                if (values.length <= 2) {
                                    // console.log('invalid delimiter1')
                                    break
                                }
                                traitValStream.write(values[5] + '\n')
                                for (var i = 0; i < values.length - 6; i++) {
                                    if (values[i + 6] == '-9' || values[i + 6] == '0' || values[i + 6] == 'N') {
                                        count[0][i]++;
                                        markerVal[line][i] = 0;
                                    }
                                    else if (values[i + 6] == '1' || values[i + 6] == 'A') {
                                        count[1][i]++;
                                        markerVal[line][i] = 1;
                                    }
                                    else if (values[i + 6] == '2' || values[i + 6] == 'T') {
                                        count[2][i]++;
                                        markerVal[line][i] = 2;
                                    }
                                    else if (values[i + 6] == '3' || values[i + 6] == 'G') {
                                        count[3][i]++;
                                        markerVal[line][i] = 3;
                                    }
                                    else if (values[i + 6] == '4' || values[i + 6] == 'C') {
                                        count[4][i]++;
                                        markerVal[line][i] = 4;
                                    }
                                    else {
                                        count[5][i]++;
                                        markerVal[line][i] = 5;
                                    }
                                }
                            }
                            for (var line = 0; line < linelength; line++) {
                                var snp = 0
                                for (var i = 0; i < genes.length - 6; i++) {
                                    var domin = 1
                                    for (var j = 2; j < 6; j++) {
                                        if (count[j][i] > count[domin][i]) {
                                            domin = j
                                        }
                                    }
                                    // if (domin == 5){console.log(line +' '+ i + ' invalid marker');}
                                    if (markerVal[line][i] == domin) {
                                        markerVal[line][i] = 0;
                                    }
                                    else {
                                        markerVal[line][i] = 1;
                                    }
                                    if (i % 2 == 1) {
                                        snp++;
                                        markerValue[line][snp] = markerVal[line][i - 1] + markerVal[line][i];
                                    }
                                }
                                markerValStream.write(markerValue[line].slice(1, markerValue[line].length) + '\n');
                            }
                            traitValStream.end()
                            markerValStream.end()
                            var id_traitLabel = guid()
                            var traitLabel_fileName = `${id_traitLabel}.csv`
                            var traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)
                            dataList.traitLabel.filetype = 'traitLabelFile'
                            dataList.traitLabel.path = traitLabel_fullPath
                            fs.writeFile(traitLabel_fullPath, traitLabel, function (err) {
                                if (err) {
                                    throw err;
                                    console.log(err);
                                }
                                else {
                                    console.log('trait Label done');
                                }
                            })

                        })
                    }
                    else if (ext_name == 'map') {
                        temp_file.on('data', function (data) {
                            result = data.toString()
                            var lines = result.split('\n')
                            var id_markerLabel = guid()
                            var markerLabel_fileName = `${id_markerLabel}.csv`
                            var markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
                            var markerLabelStream = fs.createWriteStream(markerLabel_fullPath, {'flags': 'a'})
                            dataList.markerLabel.filetype = 'markerLabelFile'
                            dataList.markerLabel.path = markerLabel_fullPath
                            for (var line = 0; line < lines.length; line++) {
                                var values = lines[line].split(' ')
                                if (values.length <= 2) {
                                    values = lines[line].split('\t')
                                }
                                if (values.length <= 2) {
                                    console.log('invalid delimiter2')
                                    break
                                }
                                markerLabelStream.write(values[1] + "," + values[0] + '\n')
                            }
                            markerLabelStream.end()
                        })
                    }
                    else if (ext_name == 'bim' || ext_name == 'bed' || ext_name == 'fam') {
                        var id = guid()
                        var temp_file2name = temp_file2name
                        var fullPath = path.join(folderPath, temp_file2name)
                        var fstream = fs.createWriteStream(fullPath)
                        console.log('get a plink file, stored in ' + fullPath)
                        //file.pipe(fstream)
                        var data2=fs.readFileSync('../../genamap2/data/'+temp_file2name)
                        temp_file.pipe(fstream)
                        fs.writeFileSync(csv_fullPath, data2)
                        var data, newFieldname
                        if (temp_fieldname === 'bedFile')        // for BED file
                        {
                            data = dataList.marker
                            temp_fieldname = "markerFile"
                        }
                        else if (temp_fieldname === 'File')      // for BIM file
                        {
                            data = dataList.trait
                            temp_fieldname = 'traitFile'
                        }
                        else if (temp_fieldname === 'traitFile') // for FAM file
                        {
                            data = dataList.snpsFeature
                            temp_fieldname = 'snpsFeatureFile'
                        } // not used
                        else console.log("Unhandled file:", temp_fieldname)
                        data.filetype = temp_fieldname
                        data.path = fullPath
                        data.projectItem = temp_file2name
                        data.name = 'PLINK File'
                    }
                    else if (ext_name == 'csv') {
                        var csv_id = guid()
                        var csv_fileName = `${csv_id}.` + ext_name;
                        var csv_fullPath = path.join(folderPath, csv_fileName)
                        var csv_fstream = fs.createWriteStream(csv_fullPath+'1')


                        var data2=fs.readFileSync('../../genamap2/data/'+temp_file2name)
                        temp_file.pipe(csv_fstream)
                        fs.writeFileSync(csv_fullPath, data2)

                        var data
                        if (temp_fieldname === 'markerFile') data = dataList.marker
                        else if (temp_fieldname === 'traitFile') data = dataList.trait
                        else if (temp_fieldname === 'markerLabelFile') data = dataList.markerLabel
                        else if (temp_fieldname === 'traitLabelFile') data = dataList.traitLabel
                        else if (temp_fieldname === 'snpsFeatureFile') data = dataList.snpsFeature
                        else if (temp_fieldname === 'populationFile') data = dataList.population
                        else if (temp_fieldname === 'bedFile') data = dataList.population
                        else console.log("Unhandled file:", temp_fieldname)
                        data.filetype = temp_fieldname
                        data.path = csv_fullPath
                    }
                    else {
                        console.log('not recognized data format')
                    }
                }
            }


        temp_fieldname=""
        temp_file=""
        temp_file2name=""
        switch (fieldname) {
            case 'project':
                projectId = val
                break
            case 'projectName':
                projectObj.name = val
                break
            case 'species':
                projectObj.species = val
                break
            case 'markerName':
                dataList.marker.projectItem = dataList.markerLabel.projectItem = val
                break
            case 'traitName':
                dataList.trait.projectItem = dataList.traitLabel.projectItem = val
                break
            case 'snpsFeature':
                dataList.snpsFeature.projectItem = val
                break
            case 'population':
                dataList.population.projectItem = val
                break
            case 'disease_type':
                GDCdatainfo.disease_type = val
                console.log(val)
                projectObj.species = 'Human'
                dataList.marker.projectItem = dataList.markerLabel.projectItem = 'marker'
                dataList.trait.projectItem = dataList.traitLabel.projectItem = 'trait'
                break
            case 'dataType':
                GDCdatainfo.datatype = val
                break
            default:
                console.log('Unhandled fieldname "' + fieldname + '" of value "' + val + '"')
        }
        if (!!GDCdatainfo.disease_type) {
            var folderPath = path.join('./.tmp', userId)
            mkdirp.sync(folderPath)
            console.log(GDCdatainfo.disease_type)
            console.log(GDCdatainfo.datatype)
            getfile(GDCdatainfo.disease_type, folderPath, GDCdatainfo.datatype.toString())
        }
    })

    function getfile(disease_type, folderPath, file_type) {
        if (!file_type) {
            file_type = "FPKM"
        }
        const id_traitval = guid()
        const traitval_fileName = `${id_traitval}.csv`
        const traitval_fullPath = path.join(folderPath, traitval_fileName)

        const id_traitLabel = guid()
        const traitLabel_fileName = `${id_traitLabel}.csv`
        const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)

        const id_markerval = guid()
        const markerval_fileName = `${id_markerval}.csv`
        const markerval_fullPath = path.join(folderPath, markerval_fileName)

        const id_markerLabel = guid()
        const markerLabel_fileName = `${id_markerLabel}.csv`
        const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)

        const origindirpath = path.join('./GDCdata/data', disease_type)
        const origintraitlabelfile = path.join(origindirpath, 'traitLabel.csv')
        const origintraitvaluefile = path.join(origindirpath, 'traitValue.csv')
        const originmarkerlabelfile = path.join(origindirpath, 'markerLabel.csv')
        const originmarkervaluefile = path.join(origindirpath, file_type + '.csv')

        dataList.markerLabel.filetype = 'markerLabelFile'
        dataList.markerLabel.path = markerLabel_fullPath
        fs.copy(originmarkerlabelfile, markerLabel_fullPath, function (err) {
            if (err) return console.error(err)
        })

        dataList.marker.filetype = 'markerFile'
        dataList.marker.path = markerval_fullPath
        fs.copy(originmarkervaluefile, markerval_fullPath, function (err) {
            if (err) return console.error(err)
        })

        dataList.traitLabel.filetype = 'traitLabelFile'
        dataList.traitLabel.path = traitLabel_fullPath
        fs.copy(origintraitlabelfile, traitLabel_fullPath, function (err) {
            if (err) return console.error(err)
        })

        dataList.trait.filetype = 'traitFile'
        dataList.trait.path = traitval_fullPath
        fs.copy(origintraitvaluefile, traitval_fullPath, function (err) {
            if (err) return console.error(err)
        })

    }

    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {


        temp_fieldname=fieldname
        temp_file=file
        //here is the former code that I want to keep in case I wrote something wrong to rev
        // if (!!filename) {
        //
        //     const folderPath = path.join('./.tmp', userId)
        //     mkdirp.sync(folderPath)
        //     var ext_name = filename.split('.')[filename.split('.').length - 1];
        //     if (ext_name == 'ped') {
        //         file.on('data', function (data) {
        //             result = data.toString()
        //             var lines = result.split('\n')
        //             var traitLabel = 'defaultTrait'
        //             const id_traitval = guid()
        //             const traitval_fileName = `${id_traitval}.csv`
        //             const traitval_fullPath = path.join(folderPath, traitval_fileName)
        //             var traitValStream = fs.createWriteStream(traitval_fullPath, {'flags': 'a'})
        //             dataList.trait.filetype = 'traitFile'
        //             dataList.trait.path = traitval_fullPath
        //
        //             const id_markerval = guid()
        //             const markerval_fileName = `${id_markerval}.csv`
        //             const markerval_fullPath = path.join(folderPath, markerval_fileName)
        //             var markerValStream = fs.createWriteStream(markerval_fullPath, {'flags': 'a'})
        //             dataList.marker.filetype = 'markerFile'
        //             dataList.marker.path = markerval_fullPath
        //
        //             var count = new Array();
        //             var genes = lines[0].split(' ');
        //             if (genes.length <= 2) {
        //                 genes = lines[0].split('\t');
        //             }
        //             for (var i = 0; i < 6; i++) {
        //                 count[i] = new Array();
        //                 for (var j = 0; j < genes.length - 6; j++) {
        //                     count[i][j] = 0
        //                 }
        //             }
        //             var linelength = 0
        //             var markerValue = new Array()
        //             var markerVal = new Array()
        //             for (var i = 0; i < lines.length; i++) {
        //                 if (lines[i] != null && lines[i] != '') {
        //                     linelength++
        //                     markerVal[i] = new Array()
        //                     markerValue[i] = new Array()
        //                 }
        //             }
        //             for (var line = 0; line < linelength; line++) {
        //                 var values = lines[line].split(' ')
        //                 if (values.length <= 2) {
        //                     values = lines[line].split('\t')
        //                 }
        //                 if (values.length <= 2) {
        //                     // console.log('invalid delimiter1')
        //                     break
        //                 }
        //                 traitValStream.write(values[5] + '\n')
        //                 for (var i = 0; i < values.length - 6; i++) {
        //                     if (values[i + 6] == '-9' || values[i + 6] == '0' || values[i + 6] == 'N') {
        //                         count[0][i]++;
        //                         markerVal[line][i] = 0;
        //                     }
        //                     else if (values[i + 6] == '1' || values[i + 6] == 'A') {
        //                         count[1][i]++;
        //                         markerVal[line][i] = 1;
        //                     }
        //                     else if (values[i + 6] == '2' || values[i + 6] == 'T') {
        //                         count[2][i]++;
        //                         markerVal[line][i] = 2;
        //                     }
        //                     else if (values[i + 6] == '3' || values[i + 6] == 'G') {
        //                         count[3][i]++;
        //                         markerVal[line][i] = 3;
        //                     }
        //                     else if (values[i + 6] == '4' || values[i + 6] == 'C') {
        //                         count[4][i]++;
        //                         markerVal[line][i] = 4;
        //                     }
        //                     else {
        //                         count[5][i]++;
        //                         markerVal[line][i] = 5;
        //                     }
        //                 }
        //             }
        //             for (var line = 0; line < linelength; line++) {
        //                 var snp = 0
        //                 for (var i = 0; i < genes.length - 6; i++) {
        //                     var domin = 1
        //                     for (var j = 2; j < 6; j++) {
        //                         if (count[j][i] > count[domin][i]) {
        //                             domin = j
        //                         }
        //                     }
        //                     // if (domin == 5){console.log(line +' '+ i + ' invalid marker');}
        //                     if (markerVal[line][i] == domin) {
        //                         markerVal[line][i] = 0;
        //                     }
        //                     else {
        //                         markerVal[line][i] = 1;
        //                     }
        //                     if (i % 2 == 1) {
        //                         snp++;
        //                         markerValue[line][snp] = markerVal[line][i - 1] + markerVal[line][i];
        //                     }
        //                 }
        //                 markerValStream.write(markerValue[line].slice(1, markerValue[line].length) + '\n');
        //             }
        //             traitValStream.end()
        //             markerValStream.end()
        //             const id_traitLabel = guid()
        //             const traitLabel_fileName = `${id_traitLabel}.csv`
        //             const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)
        //             dataList.traitLabel.filetype = 'traitLabelFile'
        //             dataList.traitLabel.path = traitLabel_fullPath
        //             fs.writeFile(traitLabel_fullPath, traitLabel, function (err) {
        //                 if (err) {
        //                     throw err;
        //                     console.log(err);
        //                 }
        //                 else {
        //                     console.log('trait Label done');
        //                 }
        //             })
        //
        //         })
        //     }
        //     else if (ext_name == 'map') {
        //         file.on('data', function (data) {
        //             result = data.toString()
        //             var lines = result.split('\n')
        //             const id_markerLabel = guid()
        //             const markerLabel_fileName = `${id_markerLabel}.csv`
        //             const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
        //             var markerLabelStream = fs.createWriteStream(markerLabel_fullPath, {'flags': 'a'})
        //             dataList.markerLabel.filetype = 'markerLabelFile'
        //             dataList.markerLabel.path = markerLabel_fullPath
        //             for (var line = 0; line < lines.length; line++) {
        //                 var values = lines[line].split(' ')
        //                 if (values.length <= 2) {
        //                     values = lines[line].split('\t')
        //                 }
        //                 if (values.length <= 2) {
        //                     console.log('invalid delimiter2')
        //                     break
        //                 }
        //                 markerLabelStream.write(values[1] + "," + values[0] + '\n')
        //             }
        //             markerLabelStream.end()
        //         })
        //     }
        //     else if (ext_name == 'bim' || ext_name == 'bed' || ext_name == 'fam') {
        //         const id = guid()
        //         const fileName = filename
        //         const fullPath = path.join(folderPath, fileName)
        //         const fstream = fs.createWriteStream(fullPath)
        //         console.log('get a plink file, stored in ' + fullPath)
        //         //file.pipe(fstream)
        //         var data2=fs.readFileSync('../../genamap2/data/'+filename)
        //         file.pipe(fstream)
        //         fs.writeFileSync(csv_fullPath, data2)
        //         var data, newFieldname
        //         if (fieldname === 'bedFile')        // for BED file
        //         {
        //             data = dataList.marker
        //             fieldname = "markerFile"
        //         }
        //         else if (fieldname === 'File')      // for BIM file
        //         {
        //             data = dataList.trait
        //             fieldname = 'traitFile'
        //         }
        //         else if (fieldname === 'traitFile') // for FAM file
        //         {
        //             data = dataList.snpsFeature
        //             fieldname = 'snpsFeatureFile'
        //         } // not used
        //         else console.log("Unhandled file:", fieldname)
        //         data.filetype = fieldname
        //         data.path = fullPath
        //         data.projectItem = fileName
        //         data.name = 'PLINK File'
        //     }
        //     else if (ext_name == 'csv') {
        //         const csv_id = guid()
        //         const csv_fileName = `${csv_id}.` + ext_name;
        //         var csv_fullPath = path.join(folderPath, csv_fileName)
        //
        //         const csv_fstream = fs.createWriteStream(csv_fullPath)
        //
        //
        //         var data2=fs.readFileSync('../../genamap2/data/'+filename)
        //         file.pipe(csv_fstream)
        //         fs.writeFileSync(csv_fullPath, data2)
        //
        //         var data
        //         if (fieldname === 'markerFile') data = dataList.marker
        //         else if (fieldname === 'traitFile') data = dataList.trait
        //         else if (fieldname === 'markerLabelFile') data = dataList.markerLabel
        //         else if (fieldname === 'traitLabelFile') data = dataList.traitLabel
        //         else if (fieldname === 'snpsFeatureFile') data = dataList.snpsFeature
        //         else if (fieldname === 'populationFile') data = dataList.population
        //         else if (fieldname === 'bedFile') data = dataList.population
        //         else console.log("Unhandled file:", fieldname)
        //         data.filetype = fieldname
        //         data.path = csv_fullPath
        //     }
        //     else {
        //         console.log('not recognized data format')
        //     }
        // }
    })

    busboy.on('finish', function () {
        console.log("end")

        const projectFinish = function (err, project) {
            // if (err) return res.status(500).json({err: err})
            if (err) throw err
            var files = [] // not really used right now

            async.each(dataList,
                function (datum, callback) {
                    if (!!datum.name && !!datum.filetype && !!datum.path) {
                        datum.project = project.id
                        app.models.file.create(datum).exec(function (err, file) {
                            if (err) throw err
                            files.push(file)
                            callback()
                        })
                    } else {
                        callback()
                    }
                }, function (err) {
                    if (err) throw err
                    //return res.json({ project, files, marker, trait, snpsFeature, population })
                    return res.json({project, files})
                }
            )
        }

        app.models.project.findOne({id: projectId}).exec(function (err, project) {
            if (!project) {
                app.models.project.findOrCreate(projectObj).exec(projectFinish)
            } else {
                projectFinish(err, project)
            }
        })
    })

    req.pipe(busboy)
})
// app.post(config.api.importDataUrl, function (req, res) {
//     var busboy = new Busboy({headers: req.headers})
//     var projectId // eslint-disable-line no-unused-vars
//     var projectObj = {}
//     /*var marker = { files: [] }
//      var trait = { files: [] }
//      var snpsFeature = { files: [] }
//      var population = { files: [] }
//      var fileDataList = {*/
//     var dataList = {
//         marker: {
//             name: 'Marker Values'
//         },
//         trait: {
//             name: 'Trait Values'
//         },
//         markerLabel: {
//             name: 'Marker Labels'
//         },
//         traitLabel: {
//             name: 'Trait Labels'
//         },
//         snpsFeature: {
//             name: 'SNPs Features'
//         },
//         population: {
//             name: 'Populations'
//         }
//     }
//
//     var GDCdatainfo = {disease_type: '', datatype: ''}
//
//     const userId = extractUserIdFromHeader(req.headers)
//
//     busboy.on('field', function (fieldname, val, fieldnameTruncated,
//                                  valTruncated, encoding, mimetype) {
//         switch (fieldname) {
//             case 'project':
//                 projectId = val
//                 break
//             case 'projectName':
//                 projectObj.name = val
//                 break
//             case 'species':
//                 projectObj.species = val
//                 break
//             case 'markerName':
//                 dataList.marker.projectItem = dataList.markerLabel.projectItem = val
//                 break
//             case 'traitName':
//                 dataList.trait.projectItem = dataList.traitLabel.projectItem = val
//                 break
//             case 'snpsFeature':
//                 dataList.snpsFeature.projectItem = val
//                 break
//             case 'population':
//                 dataList.population.projectItem = val
//                 break
//             case 'disease_type':
//                 GDCdatainfo.disease_type = val
//                 console.log(val)
//                 projectObj.species = 'Human'
//                 dataList.marker.projectItem = dataList.markerLabel.projectItem = 'marker'
//                 dataList.trait.projectItem = dataList.traitLabel.projectItem = 'trait'
//                 break
//             case 'dataType':
//                 GDCdatainfo.datatype = val
//                 break
//             default:
//                 console.log('Unhandled fieldname "' + fieldname + '" of value "' + val + '"')
//         }
//         if (!!GDCdatainfo.disease_type) {
//             const folderPath = path.join('./.tmp', userId)
//             mkdirp.sync(folderPath)
//             console.log(GDCdatainfo.disease_type)
//             console.log(GDCdatainfo.datatype)
//             getfile(GDCdatainfo.disease_type, folderPath, GDCdatainfo.datatype.toString())
//         }
//     })
//
//     function getfile(disease_type, folderPath, file_type) {
//         if (!file_type) {
//             file_type = "FPKM"
//         }
//         const id_traitval = guid()
//         const traitval_fileName = `${id_traitval}.csv`
//         const traitval_fullPath = path.join(folderPath, traitval_fileName)
//
//         const id_traitLabel = guid()
//         const traitLabel_fileName = `${id_traitLabel}.csv`
//         const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)
//
//         const id_markerval = guid()
//         const markerval_fileName = `${id_markerval}.csv`
//         const markerval_fullPath = path.join(folderPath, markerval_fileName)
//
//         const id_markerLabel = guid()
//         const markerLabel_fileName = `${id_markerLabel}.csv`
//         const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
//
//         const origindirpath = path.join('./GDCdata/data', disease_type)
//         const origintraitlabelfile = path.join(origindirpath, 'traitLabel.csv')
//         const origintraitvaluefile = path.join(origindirpath, 'traitValue.csv')
//         const originmarkerlabelfile = path.join(origindirpath, 'markerLabel.csv')
//         const originmarkervaluefile = path.join(origindirpath, file_type + '.csv')
//
//         dataList.markerLabel.filetype = 'markerLabelFile'
//         dataList.markerLabel.path = markerLabel_fullPath
//         fs.copy(originmarkerlabelfile, markerLabel_fullPath, function (err) {
//             if (err) return console.error(err)
//         })
//
//         dataList.marker.filetype = 'markerFile'
//         dataList.marker.path = markerval_fullPath
//         fs.copy(originmarkervaluefile, markerval_fullPath, function (err) {
//             if (err) return console.error(err)
//         })
//
//         dataList.traitLabel.filetype = 'traitLabelFile'
//         dataList.traitLabel.path = traitLabel_fullPath
//         fs.copy(origintraitlabelfile, traitLabel_fullPath, function (err) {
//             if (err) return console.error(err)
//         })
//
//         dataList.trait.filetype = 'traitFile'
//         dataList.trait.path = traitval_fullPath
//         fs.copy(origintraitvaluefile, traitval_fullPath, function (err) {
//             if (err) return console.error(err)
//         })
//
//     }
//
//
//     busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
//             if (!!filename) {
//                 const folderPath = path.join('./.tmp', userId)
//                 mkdirp.sync(folderPath)
//                 var ext_name = filename.split('.')[filename.split('.').length - 1];
//                 if (ext_name == 'ped') {
//                     file.on('data', function (data) {
//                         result = data.toString()
//                         var lines = result.split('\n')
//                         var traitLabel = 'defaultTrait'
//                         const id_traitval = guid()
//                         const traitval_fileName = `${id_traitval}.csv`
//                         const traitval_fullPath = path.join(folderPath, traitval_fileName)
//                         var traitValStream = fs.createWriteStream(traitval_fullPath, {'flags': 'a'})
//                         dataList.trait.filetype = 'traitFile'
//                         dataList.trait.path = traitval_fullPath
//
//                         const id_markerval = guid()
//                         const markerval_fileName = `${id_markerval}.csv`
//                         const markerval_fullPath = path.join(folderPath, markerval_fileName)
//                         var markerValStream = fs.createWriteStream(markerval_fullPath, {'flags': 'a'})
//                         dataList.marker.filetype = 'markerFile'
//                         dataList.marker.path = markerval_fullPath
//
//                         var count = new Array();
//                         var genes = lines[0].split(' ');
//                         if (genes.length <= 2) {
//                             genes = lines[0].split('\t');
//                         }
//                         for (var i = 0; i < 6; i++) {
//                             count[i] = new Array();
//                             for (var j = 0; j < genes.length - 6; j++) {
//                                 count[i][j] = 0
//                             }
//                         }
//                         var linelength = 0
//                         var markerValue = new Array()
//                         var markerVal = new Array()
//                         for (var i = 0; i < lines.length; i++) {
//                             if (lines[i] != null && lines[i] != '') {
//                                 linelength++
//                                 markerVal[i] = new Array()
//                                 markerValue[i] = new Array()
//                             }
//                         }
//                         for (var line = 0; line < linelength; line++) {
//                             var values = lines[line].split(' ')
//                             if (values.length <= 2) {
//                                 values = lines[line].split('\t')
//                             }
//                             if (values.length <= 2) {
//                                 // console.log('invalid delimiter1')
//                                 break
//                             }
//                             traitValStream.write(values[5] + '\n')
//                             for (var i = 0; i < values.length - 6; i++) {
//                                 if (values[i + 6] == '-9' || values[i + 6] == '0' || values[i + 6] == 'N') {
//                                     count[0][i]++;
//                                     markerVal[line][i] = 0;
//                                 }
//                                 else if (values[i + 6] == '1' || values[i + 6] == 'A') {
//                                     count[1][i]++;
//                                     markerVal[line][i] = 1;
//                                 }
//                                 else if (values[i + 6] == '2' || values[i + 6] == 'T') {
//                                     count[2][i]++;
//                                     markerVal[line][i] = 2;
//                                 }
//                                 else if (values[i + 6] == '3' || values[i + 6] == 'G') {
//                                     count[3][i]++;
//                                     markerVal[line][i] = 3;
//                                 }
//                                 else if (values[i + 6] == '4' || values[i + 6] == 'C') {
//                                     count[4][i]++;
//                                     markerVal[line][i] = 4;
//                                 }
//                                 else {
//                                     count[5][i]++;
//                                     markerVal[line][i] = 5;
//                                 }
//                             }
//                         }
//                         for (var line = 0; line < linelength; line++) {
//                             var snp = 0
//                             for (var i = 0; i < genes.length - 6; i++) {
//                                 var domin = 1
//                                 for (var j = 2; j < 6; j++) {
//                                     if (count[j][i] > count[domin][i]) {
//                                         domin = j
//                                     }
//                                 }
//                                 // if (domin == 5){console.log(line +' '+ i + ' invalid marker');}
//                                 if (markerVal[line][i] == domin) {
//                                     markerVal[line][i] = 0;
//                                 }
//                                 else {
//                                     markerVal[line][i] = 1;
//                                 }
//                                 if (i % 2 == 1) {
//                                     snp++;
//                                     markerValue[line][snp] = markerVal[line][i - 1] + markerVal[line][i];
//                                 }
//                             }
//                             markerValStream.write(markerValue[line].slice(1, markerValue[line].length) + '\n');
//                         }
//                         traitValStream.end()
//                         markerValStream.end()
//                         const id_traitLabel = guid()
//                         const traitLabel_fileName = `${id_traitLabel}.csv`
//                         const traitLabel_fullPath = path.join(folderPath, traitLabel_fileName)
//                         dataList.traitLabel.filetype = 'traitLabelFile'
//                         dataList.traitLabel.path = traitLabel_fullPath
//                         fs.writeFile(traitLabel_fullPath, traitLabel, function (err) {
//                             if (err) {
//                                 throw err;
//                                 console.log(err);
//                             }
//                             else {
//                                 console.log('trait Label done');
//                             }
//                         })
//
//                     })
//                 }
//                 else if (ext_name == 'map') {
//                     file.on('data', function (data) {
//                         result = data.toString()
//                         var lines = result.split('\n')
//                         const id_markerLabel = guid()
//                         const markerLabel_fileName = `${id_markerLabel}.csv`
//                         const markerLabel_fullPath = path.join(folderPath, markerLabel_fileName)
//                         var markerLabelStream = fs.createWriteStream(markerLabel_fullPath, {'flags': 'a'})
//                         dataList.markerLabel.filetype = 'markerLabelFile'
//                         dataList.markerLabel.path = markerLabel_fullPath
//                         for (var line = 0; line < lines.length; line++) {
//                             var values = lines[line].split(' ')
//                             if (values.length <= 2) {
//                                 values = lines[line].split('\t')
//                             }
//                             if (values.length <= 2) {
//                                 console.log('invalid delimiter2')
//                                 break
//                             }
//                             markerLabelStream.write(values[1] + "," + values[0] + '\n')
//                         }
//                         markerLabelStream.end()
//                     })
//                 }
//                 else if (ext_name == 'bim' || ext_name == 'bed' || ext_name == 'fam') {
//                     const id = guid()
//                     const fileName = filename
//                     const fullPath = path.join(folderPath, fileName)
//                     const fstream = fs.createWriteStream(fullPath)
//                     console.log('get a plink file, stored in ' + fullPath)
//                     file.pipe(fstream)
//                     var data, newFieldname
//                     if (fieldname === 'bedFile')        // for BED file
//                     {
//                         data = dataList.marker
//                         fieldname = "markerFile"
//                     }
//                     else if (fieldname === 'File')      // for BIM file
//                     {
//                         data = dataList.trait
//                         fieldname = 'traitFile'
//                     }
//                     else if (fieldname === 'traitFile') // for FAM file
//                     {
//                         data = dataList.snpsFeature
//                         fieldname = 'snpsFeatureFile'
//                     } // not used
//                     else console.log("Unhandled file:", fieldname)
//                     data.filetype = fieldname
//                     data.path = fullPath
//                     data.projectItem = fileName
//                     data.name = 'PLINK File'
//                 }
//                 else if (ext_name == 'csv') {
//                     const csv_id = guid()
//                     const csv_fileName = `${csv_id}.` + ext_name;
//                     const csv_fullPath = path.join(folderPath, csv_fileName)
//                     const csv_fstream = fs.createWriteStream(csv_fullPath)
//                     file.pipe(csv_fstream)
//                     var data
//                     if (fieldname === 'markerFile') data = dataList.marker
//                     else if (fieldname === 'traitFile') data = dataList.trait
//                     else if (fieldname === 'markerLabelFile') data = dataList.markerLabel
//                     else if (fieldname === 'traitLabelFile') data = dataList.traitLabel
//                     else if (fieldname === 'snpsFeatureFile') data = dataList.snpsFeature
//                     else if (fieldname === 'populationFile') data = dataList.population
//                     else if (fieldname === 'bedFile') data = dataList.population
//                     else console.log("Unhandled file:", fieldname)
//                     data.filetype = fieldname
//                     data.path = csv_fullPath
//                 }
//                 else {
//                     console.log('not recognized data format')
//                 }
//             }
//
//         }
//     )
//
//     busboy.on('finish', function () {
//         const projectFinish = function (err, project) {
//             // if (err) return res.status(500).json({err: err})
//             if (err) throw err
//             var files = [] // not really used right now
//
//             async.each(dataList,
//                 function (datum, callback) {
//                     if (!!datum.name && !!datum.filetype && !!datum.path) {
//                         datum.project = project.id
//                         app.models.file.create(datum).exec(function (err, file) {
//                             if (err) throw err
//                             files.push(file)
//                             callback()
//                         })
//                     } else {
//                         callback()
//                     }
//                 }, function (err) {
//                     if (err) throw err
//                     //return res.json({ project, files, marker, trait, snpsFeature, population })
//                     return res.json({project, files})
//                 }
//             )
//         }
//
//         app.models.project.findOne({id: projectId}).exec(function (err, project) {
//             if (!project) {
//                 app.models.project.findOrCreate(projectObj).exec(projectFinish)
//             } else {
//                 projectFinish(err, project)
//             }
//         })
//     })
//
//     req.pipe(busboy)
// })
/**
 * @param {Object} req
 * @param {Object} [req.body]
 * @param {Number} [req.body.project]
 * @param {Number} [req.body.marker]
 * @param {Number} [req.body.trait]
 * @param {Object} [req.body.algorithmOptions]
 * @param {Object} [req.body.modelOptions]
 * @example req.body = {
 *   project: 1,
 *   marker: 7,
 *   trait: 8,
 *   other_data: [{name: 'snpsFeature1' id: 1}, {}]
 *   algorithmOptions: {type:1, options:{tolerance:0.01, learning_rate:0.01}},
 *   modelOptions: {type:1, options: {lambda:0.01, L2_lambda: 0.01}}
 * }
 */

app.post(config.api.runAnalysisUrl, function (req, res) {
    // Get marker file
    app.models.file.findOne({id: req.body.marker.data.id}).exec(function (err, markerFile) {
        if (err) console.log('Error getting marker for analysis: ', err);
        // Get trait file
        app.models.file.findOne({id: req.body.trait.data.id}).exec(function (err, traitFile) {
            if (err) console.log('Error getting trait for analysis: ', err)
            // Create job
            const jobId = Scheduler.newJob({
                'algorithm_options': req.body.algorithmOptions,
                'model_options': req.body.modelOptions
            })
            if (jobId === 0) {
                return res.json({msg: 'error creating job'});
            }
            Scheduler.setX(jobId, markerFile.path);
            Scheduler.setY(jobId, traitFile.path);
            const startJobFinish = function () {
                const userId = extractUserIdFromHeader(req.headers)
                const id = guid()
                const userPath = path.join('./.tmp', userId)
                const fileName = `${id}.csv`
                const resultsPath = path.join(userPath, fileName)

                try {
                    fs.writeFile(resultsPath, "", function (err) {
                        app.models.file.create({
                            name: req.body.jobName + " Matrix View",
                            filetype: 'resultFile',
                            path: resultsPath,
                            project: req.body.project,
                            info: {
                                resultType: 'matrix',
                                labels: {
                                    marker: req.body.marker.data.labelId,
                                    trait: req.body.trait.data.labelId
                                }
                            },
                            projectItem: 'Results'
                        }).exec(function (err, file) {
                            if (err) throw err
                            app.models.file.findOne({id: req.body.marker.data.labelId}).exec(function (err, mLabelsFile) {
                                app.models.file.findOne({id: req.body.marker.data.id}).exec(function (err, mPlinkFile) {
                                    console.log(typeof mLabelsFile)
                                    if (typeof mLabelsFile != 'undefined') {
                                        console.log('DEBUG-ywt: hello from csv')
                                        Scheduler.setMetaData(jobId, file.id, mLabelsFile.path)
                                    }
                                    else {
                                        console.log('DEBUG-ywt: hello from plink' + mPlinkFile.path)
                                        Scheduler.setMetaData(jobId, file.id, mPlinkFile.path)
                                    }
                                    var success = Scheduler.startJob(jobId, function (retval) {
                                        if (retval) {
                                            console.log(`Data loaded from job ${jobId}!`)
                                            if (typeof mLabelsFile != 'undefined') {
                                                loadTraits(req.body.trait.data.labelId, file.id)
                                            }
                                            else {
                                                traitName = mPlinkFile.path.split("/").pop().split(".")[0]
                                                console.log("get trait name: " + traitName)
                                                loadTrait(traitName, file.id)
                                            }

                                        } else {
                                            console.log(`Data load from job ${jobId} FAILED!`);
                                        }
                                    })
                                    return res.json({status: success, jobId, resultsPath})
                                })
                            })

                        })
                    })

                } catch (err) {
                    console.log(err)
                }

            }
            // Add any extra files
            const testAll = function (elem, index, array) {
                return elem;
            }
            var ready = req.body.other_data.map((value, index) => {
                false
            });
            if (req.body.other_data.length > 0) {
                req.body.other_data.map((value, index) => {
                    console.log(value);
                    if (!value.val || !value.val.data || !value.val.data.id || value.val.data.id < 0) {
                        ready[index] = true;
                        if (ready.every(testAll)) {
                            startJobFinish();
                        }
                        return false;
                    }
                    app.models.file.findOne({id: value.val.data.id}).exec(function (err, attributeFile) {
                        if (err) console.log('Error getting attribute' + value.val.name + 'for analysis: ' + err);
                        if (attributeFile) {
                            csvtojson({noheader: true}).fromFile(attributeFile.path, function (err, attributeData) {
                                if (err) console.log('Error getting extra data for analysis: ', err);
                                try {
                                    Scheduler.setModelAttributeMatrix(jobId, value.name, attributeData);
                                    ready[index] = true;
                                    if (ready.every(testAll)) {
                                        startJobFinish();
                                    }
                                } catch (err) {
                                    console.log(err);
                                    return false;
                                }
                            })
                        }
                    })
                })
            } else {
                startJobFinish();
            }
            /*results.map((value, index) => assert(value));*/

        });
    })
})


// TODO: implement cancelJob [Issue: https://github.com/blengerich/GenAMap_V2/issues/39]
/**
 * @param {Object} req
 * @param {Number} req.body.jobId
 **/
app.post(config.api.cancelJobUrl, function (req, res) {
    console.log("cancelling job", Scheduler.cancelJob(parseInt(req.body.jobId)));
})


app.get(config.api.projectUrl, function (req, res) {
    app.models.project.find().populate('files').exec(function (err, models) {
        if (err) return res.status(500).json({err: err})
        return res.json(models)
    })
})

app.get(`${config.api.projectUrl}/:id`, function (req, res) {
    app.models.project.findOne({id: req.params.id}).populate('files').exec(function (err, model) {
        if (err) return res.status(500).json({err: err})
        return res.json(model)
    })
})

app.get('/api/species', function (req, res) {
    return res.json([{name: 'Human', id: 1}, {name: 'Fly', id: 2}])
})

app.get('/api/algorithms', function (req, res) {
    /*
     model_type = {
     linear_regression: 1,
     ada_multi_lasso: 2,
     gf_lasso: 3,
     multi_pop_lasso: 4,
     tree_lasso: 5
     };
     */
    return res.json([
        {name: 'Linear Regression', id: 1}
        /*{name: "Ada Multi Lasso", id: 2},
         {name: "GF Lasso", id: 3},
         {name: "Multi Pop Lasso": 4},
         {name: "Tree Lasso", id: 5} */
    ])
})

function extractTokenFromHeader(header) {
    return header.replace('Bearer', '').trim()
}

function extractUserIdFromHeader(header) {
    const token = extractTokenFromHeader(header.authorization)
    const userId = extractFromToken(token, 'id')
    return userId
}

app.post(config.api.saveUrl, function (req, res) {
    const userId = extractUserIdFromHeader(req.headers)
    app.models.state.update({user: userId}, {state: JSON.stringify(req.body)})
        .exec(function (updateErr, updatedState) {
            if (updateErr || updatedState.length === 0) {
                app.models.state.create({state: JSON.stringify(req.body), user: userId})
                    .exec(function (createErr, createdState) {
                        if (createErr) return res.status(500).json({createErr})
                        return res.json(createdState)
                    })
            }
            if (updatedState.length > 1) console.log('Whoops, more than one state saved for a user')
            return res.json(updatedState[0])
        })
})

// app.get(`${config.api.userUrl}/:userId`, function (req, res) {
// })

app.get(`${config.api.saveUrl}/:userId`, function (req, res) {
    app.models.state.findOne({user: req.params.userId}).exec(function (err, model) {
        if (err) return res.status(500).json({err})
        if (!model) return res.status(500).json({message: 'user state does not exist'})
        const userState = JSON.parse(model.state)
        return res.json(userState)
    })
})

orm.initialize(waterlineConfig, function (err, models) {
    if (err) throw err

    app.models = models.collections
    app.connections = models.connections

    writeData.loadSNPs('./api/snpdata.txt').then(console.log)

    console.log('Connected correctly to server.')
    var server = app.listen(3000, function () {
        var port = server.address().port || 'default port'
        console.log('Example app listening on port', port)

        var email = "demo@demo.com"
        var password = "demo"
        var organization = "demo"
        var initialState = {}
        app.models.user.count({email, password, organization}).exec((err, c) => {
            if (c <= 0) {
                app.models.user.create({email, password, organization}).exec(function (err, createdUser) {
                    if (err) console.log(err)

                    app.models.state.create({
                        state: JSON.stringify(initialState),
                        user: createdUser.id
                    }).exec(function (err, createdState) {
                    })
                })
            }
        })
    })
})

app.post(config.api.ChangePasswordUrl, function (req, res) {
    const FormerPassword = req.body.FormerPassword
    const NewPassword = req.body.NewPassword
    const ConfirmNewPassword = req.body.ConfirmNewPassword
    const initialState = {}
    const userId = extractUserIdFromHeader(req.headers)
    console.log(FormerPassword)
    console.log(NewPassword)
    console.log(ConfirmNewPassword)

    if (!NewPassword || !FormerPassword) {
        return res.status(400).send({message: 'Missing former password or new password'})
    }

    if (NewPassword != ConfirmNewPassword) {
        return res.status(400).send({message: "New passwords did not match"})
    }

    app.models.user.findOne({id: userId}).exec(function (err, foundUser) {
        if (err) console.log(err)
        if (foundUser.password !== FormerPassword) {
            return res.status(400).send({message: 'Former password did not match'})
        }
        app.models.user.update({id: userId}, {password: NewPassword}).exec(function (err, updated) {
                if (err) return res.status(500).json({err})
                console.log(updated)
                return res.json(foundUser)
            }
        )
    })
})

// GENEVIZ API

var api = require('./api/routes/getRange')
var writeData = require('./api/routes/writeData')
var db = require('./api/db')

var simpleCache = {}


// the id is the id of the result file corresponding to the loaded data
// query parameters : start, end, zoom, thresh
// responds with aggregated data in json form
// see ./api/routes/getRange.js for moreinfo
app.get('/api/get-range/:id', function (req, res) {
    var datas = db.collection('datas')
    datas.count({fileName: req.params.id}, (err, count) => {
        if (err) return res.status(500).send(err)
        if (count == 0) {
            return res.send("no data loaded")
        } else {
            var completeID = req.params.id
            var response = {
                start: req.query.start,
                end: req.query.end,
                zoom: req.query.zoom,
                thresh: req.query.thresh
            };
            var range = response.start + ":" + response.end
            if (!response.thresh) response.thresh = "undefined"
            if (simpleCache[completeID] &&
                simpleCache[completeID][range] &&
                simpleCache[completeID][range][response.zoom] &&
                simpleCache[completeID][range][response.zoom][response.thresh]) {
                console.log("CACHE YES")
                res.json(simpleCache[completeID][range][response.zoom][response.thresh])
            } else {
                api.getRange(response.start, response.end, response.zoom, completeID, response.thresh).then(function (result) {
                    if (!simpleCache[completeID]) simpleCache[completeID] = {}
                    if (!simpleCache[completeID][range]) simpleCache[completeID][range] = {}
                    if (!simpleCache[completeID][range][response.zoom])
                        simpleCache[completeID][range][response.zoom] = {}
                    if (!simpleCache[completeID][range][response.zoom][response.thresh])
                        simpleCache[completeID][range][response.zoom][response.thresh] = result
                    res.json(result);
                });
            }
        }
    })
})

function loadTrait(traitName, resultsId) {
    writeData.loadTrait(traitName, resultsId).then(console.log)
}

function loadTraits(traitsId, resultsId) {

    app.models.file.findOne({id: traitsId}, (err, traits_file) => {
        if (err) return console.log(err)
        csvtojson({noheader: true}).fromFile(traits_file.path, (err, data) => {
            if (err) console.log(err)
            traits = data.map((obj) => {
                return obj["field1"]
            })
            writeData.loadTraits(traits, resultsId).then(console.log)
        })
    })
}

// loads project data to mongo
/**
 * @param {Object} req
 * @param {Object} [req.body]
 * @param {Number} [req.body.markers] (id of marker_label file)
 * @param {Number} [req.body.traits]
 * @param {Number} [req.body.results]       (id of results file)
 */
// app.post('/api/load-data', function (req, res) {
//   console.log(req.body)
//   res.json(loadResults(req.body.markers,req.body.traits,req.body.results))
//
// })

// deleta all stored data in mongo and corresponding file records
app.delete('/api/del-data', function (req, res) {
    writeData.deleteAll(() =>
        res.json("Data deleted!")
    );
})
