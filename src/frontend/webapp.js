var express = require('express')
var Waterline = require('waterline')
var bodyParser = require('body-parser')
var Busboy = require('busboy')
var fs = require('fs')
var path = require('path')
var expressjwt = require('express-jwt')
var async = require('async')
var diskAdapter = require('sails-disk')
var omit = require('lodash.omit')
var mkdirp = require('mkdirp')
var Converter = require('csvtojson').Converter;
var nodemailer = require('nodemailer')
require('es6-promise').polyfill()
require('isomorphic-fetch')

var config = require('./config')
var Scheduler = require('../Scheduler/node/build/Release/scheduler.node')
var jwt = require('jsonwebtoken')

// temp
var http = require('http')
var querystring = require('querystring')
//var favicon = require('serve-favicon')

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
const createToken = (content) => jwt.sign(content, config.secret, { expiresIn: '5h' })

var app = express()
var orm = new Waterline()

app.engine('.html', require('ejs').renderFile)
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api/', expressjwt({ secret: config.secret }))
//app.use(favicon(__dirname + '/static/images/favicon.ico'));

const waterlineConfig = {
  adapters: {
    'default': diskAdapter,
    disk: diskAdapter
  },

  connections: {
    myLocalDisk: {
      adapter: 'disk'
    }
  },

  defaults: {
    migrate: 'alter'
  }

}

const User = Waterline.Collection.extend({
  tableName: 'user',
  connection: 'myLocalDisk',

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
      type: 'int',
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
  connection: 'myLocalDisk',

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
  connection: 'myLocalDisk',

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
    }
  }
})

const State = Waterline.Collection.extend({
  tableName: 'state',
  connection: 'myLocalDisk',

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
  tableName: 'tempUser',
  connection: 'myLocalDisk',

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
      type: 'int',
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
  const initialState = {}

  if (!email || !password) {
    return res.status(400).send({message: 'Missing email or password'})
  }

  if (password !== password2) {
    return res.status(400).send({message: "Passwords don't match"})
  }

  app.models.user.findOne({ email }).exec(function (err, foundUser) {
    if (err) console.log(err)
    if (foundUser) {
      return res.status(400).send({message: 'Email already in use'})
    }

    app.models.tempuser.findOne({ email }).exec(function (err, foundTempUser) {
      if (err) console.log(err)
      if (foundTempUser) {
        return res.status(400).send({message: 'Email already in use'})
      }

      app.models.tempuser.create({ email, password }).exec(function (err, createdTempUser) {
        if (err) {
          if (err.code === 'E_VALIDATION')
            return res.status(400).json({message: 'Invalid email address'})
          return res.status(500).json({ err, from: 'createdUser' })
        }

        return res.json(createdTempUser)
      })
    })
  })
})

app.post(config.api.requestUserConfirmUrl, function (req, res) {
  var transporter = nodemailer.createTransport('smtps://genamap@163.com:genamap2016@smtp.163.com');

  var mailOptions = {
      from: '"GenAMap" <genamap@163.com>', // sender address
      to: req.body.email,
      subject: 'GenAMap Sign-up Comfiration', // Subject line
      text: 'Registration Comfiration',
      html: 'Verification code: ' + req.body.code + '<br/>Or confirm at 192.168.99.100:49160/#/confirm/' + req.body.code
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error)
        return res.status(500).send({message: 'Error sending confirmation email to user'})
      }
      console.log('Message sent: ' + info.response);
      return res.json(info.response)
  });
})

app.get(`${config.api.confirmAccountUrl}/:code`, function (req, res) {
  const initialState = {}

  app.models.tempuser.findOne({ id: req.params.code }).exec(function (err, foundTempUser) {
    if (err) console.log(err)
    if (!foundTempUser) {
      return res.status(400).send({message: 'Could not verify user: incorrect code'})
    }

    var email = foundTempUser.email
    var password = foundTempUser.password

    app.models.tempuser.destroy({ id: req.params.code }).exec(function (err) {
      if (err) console.log(err)

      app.models.user.create({ email, password }).exec(function (err, createdUser) {
        if (err) {
          return res.status(500).json({ err, from: 'createdUser' })
        }
        app.models.state.create({ state: JSON.stringify(initialState), user: createdUser.id }).exec(function (err, createdState) {
          if (err) return res.status(500).json({ err, from: 'createdState' })
          return res.json({ email, password })
        })
      })
    })
  })
})

app.post(config.api.createSessionUrl, function (req, res) {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).send({message: 'Missing email or password'})
  }

  app.models.user.findOne({ email }).exec(function (err, user) {
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
  const results = (Scheduler.getJobResult(jobId))[0].replace(/(\r\n|\n|\r)/gm,"")

  return res.json({ progress })
})

app.post(`${config.api.getAnalysisResultsUrl}`, function(req, res) {
  const projectId = req.body.projectId

  function checkFileExists(reqPath) {
    /* check if result file has been written and added to database */
    fs.stat(reqPath, function(err, stats) {
      if (!err) {
        app.models.file.findOne({ path: reqPath }, function(err, file) {
          if (err) console.log(err)

          if (!file) {
            setTimeout(checkFileExists, 500, reqPath)
          } else {
            return res.json({ project: projectId, files: [file] })
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
    if (err) return res.status(500).json({ err: err })

    if (!model) return res.status(404).json({ message: 'File not found' })

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
      return res.json({file: file.id, project: file.project, projectItem: file.projectItem })
    })
  })
})

app.post(config.api.importDataUrl, function (req, res) {
  var busboy = new Busboy({ headers: req.headers })
  var projectId // eslint-disable-line no-unused-vars
  var projectObj = {}
  /*var marker = { files: [] }
  var trait = { files: [] }
  var snpsFeature = { files: [] }
  var population = { files: [] }
  var fileDataList = {*/
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
  const userId = extractUserIdFromHeader(req.headers)

  busboy.on('field', function (fieldname, val, fieldnameTruncated,
                              valTruncated, encoding, mimetype) {
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
      default:
        console.log('Unhandled fieldname "' + fieldname + '" of value "' + val + '"')
    }
  })

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    if (!!filename) {
      const id = guid()
      const folderPath = path.join('./.tmp', userId)
      mkdirp.sync(folderPath)
      const fileName = `${id}.csv`
      const fullPath = path.join(folderPath, fileName)
      const fstream = fs.createWriteStream(fullPath)
      var data
      file.pipe(fstream);

      if (fieldname === 'markerFile') data = dataList.marker
      else if (fieldname === 'traitFile') data = dataList.trait
      else if (fieldname === 'markerLabelFile') data = dataList.markerLabel
      else if (fieldname === 'traitLabelFile') data = dataList.traitLabel
      else if (fieldname === 'snpsFeatureFile') data = dataList.snpsFeature
      else if (fieldname === 'populationFile') data = dataList.population
      else console.log("Unhandled file:", fieldname)

      data.filetype = fieldname
      data.path = fullPath
    }
  })

  busboy.on('finish', function () {
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
              /*
              if (file.filetype === 'markerFile') {
                marker.id = file.id
                marker.files.push(file)
              } else if (file.filetype === 'markerLabelFile') {
                marker.labelId = file.id
                marker.files.push(file)
              } else if (file.filetype === 'traitFile') {
                trait.id = file.id
                trait.files.push(file)
              } else if (file.filetype === 'traitLabelFile') {
                trait.labelId = file.id
                trait.files.push(file)
              } else if (file.filetype === 'snpsFeatureFile') {
                snpsFeature.id = file.id
                snpsFeature.files.push(file)
              } else if (file.filetype === 'populationFile') {
                population.id = file.id
                population.files.push(file)
              }*/
              callback()
            })
          } else {
            callback()
          }
        }, function (err) {
          if (err) throw err
          //return res.json({ project, files, marker, trait, snpsFeature, population })
          return res.json({ project, files })
        }
      )
    }

    app.models.project.findOne({ id: projectId }).exec(function (err, project) {
      if (!project) {
        app.models.project.findOrCreate(projectObj).exec(projectFinish)
      } else {
        projectFinish(err, project)
      }
    })
  })

  req.pipe(busboy)
})

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
  var converter = new Converter({noheader:true});
  // Get marker file
  app.models.file.findOne({ id: req.body.marker.data.id }).exec(function (err, markerFile) {
    if (err) console.log('Error getting marker for analysis: ', err);
    converter.fromFile(markerFile.path, function(err, markerData) {
      if (err) console.log('Error getting marker for analysis: ', err);
      // Get trait file
      app.models.file.findOne({ id: req.body.trait.data.id }).exec(function (err, traitFile) {
        if (err) console.log('Error getting trait for analysis: ', err)
        var traitConverter = new Converter({noheader:true});
        traitConverter.fromFile(traitFile.path, function(err, traitData) {
          if (err) console.log('Error getting trait for analysis: ', err)
          // Create job
          const jobId = Scheduler.newJob({'algorithm_options': req.body.algorithmOptions, 'model_options': req.body.modelOptions})
          if (jobId === -1) {
            return res.json({msg: 'error creating job'});
          }
          Scheduler.setX(jobId, markerData);
          Scheduler.setY(jobId, traitData);
          const startJobFinish = function() {
            const userId = extractUserIdFromHeader(req.headers)
            const id = guid()
            const userPath = path.join('./.tmp', userId)
            const fileName = `${id}.csv`
            const resultsPath = path.join(userPath, fileName)

            try {
              var success = Scheduler.startJob(jobId, function (results) {
                // TODO: streamline this results passing - multiple types of data?
                results[0] = results[0].replace(/(\r\n|\n|\r)/gm,"")

                fs.writeFile(resultsPath, results, function(err) {
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
                  })
                })
              })
            } catch (err) {
              console.log(err)
            }
            return res.json({ status: success, jobId, resultsPath })
          }
          // Add any extra files
          const testAll = function(elem, index, array) {
            return elem;
          }
          var ready = req.body.other_data.map((value, index) => { false });
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
              app.models.file.findOne({id: value.val.data.id}).exec(function(err, attributeFile) {
                if (err) console.log('Error getting attribute' + value.val.name + 'for analysis: ' + err);
                if (attributeFile) {
                  var attributeConverter = new Converter({noheader: true});
                  attributeConverter.fromFile(attributeFile.path, function(err, attributeData) {
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
      });
    });
  })
})


// TODO: implement cancelJob [Issue: https://github.com/blengerich/GenAMap_V2/issues/39]
/**
* @param {Object} req
* @param {Number} req.body.jobId
**/
app.post(config.api.cancelJobUrl, function(req, res) {
	console.log("cancelling job", Scheduler.cancelJob(req.body.jobId));
})


app.get('/api/projects', function (req, res) {
  app.models.project.find().populate('files').exec(function (err, models) {
    if (err) return res.status(500).json({err: err})
    return res.json(models)
  })
})

app.get('/api/projects/:id', function (req, res) {
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

function extractTokenFromHeader (header) {
  return header.replace('Bearer', '').trim()
}

function extractUserIdFromHeader (header) {
  const token = extractTokenFromHeader(header.authorization)
  const userId = extractFromToken(token, 'id')
  return userId
}

app.post(config.api.saveUrl, function (req, res) {
  const userId = extractUserIdFromHeader(req.headers)
  app.models.state.update({ user: userId }, { state: JSON.stringify(req.body) })
  .exec(function (updateErr, updatedState) {
    if (updateErr || updatedState.length === 0) {
      app.models.state.create({ state: JSON.stringify(req.body), user: userId })
      .exec(function (createErr, createdState) {
        if (createErr) return res.status(500).json({ createErr })
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
  app.models.state.findOne({ user: req.params.userId }).exec(function (err, model) {
    if (err) return res.status(500).json({ err })
    if (!model) return res.status(500).json({ message: 'user state does not exist' })
    const userState = JSON.parse(model.state)
    return res.json(userState)
  })
})

orm.initialize(waterlineConfig, function (err, models) {
  if (err) throw err

  app.models = models.collections
  app.connections = models.connections

  console.log('Connected correctly to server.')
  var server = app.listen(3000, function () {
    var port = server.address().port || 'default port'
    console.log('Example app listening on port', port)
  })
})
