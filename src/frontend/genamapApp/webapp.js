var express = require('express'),
    bodyParser = require('body-parser'),
    Waterline = require('waterline'),
    Busboy = require('busboy'),
    os = require('os'),
    fs = require('fs'),
    PouchDB = require('pouchdb'),
    Scheduler = require('../../Scheduler/node/build/Release/scheduler');


var app = express();
var orm = new Waterline();
var activityDb = new PouchDB('activity');

app.engine('.html', require('ejs').renderFile);
app.use(express.static('static'));
app.use(bodyParser.json());

var diskAdapter = require('sails-disk');

var waterlineConfig = {
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

};

var User = Waterline.Collection.extend({
  tableName: 'user',
  connection: 'myLocalDisk',

  attributes: {
    username: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: false
    },
    password: {
      type: 'string',
      required: false
    },
    organization: {
      type: 'int',
      required: false
    }
  }
});

var Project = Waterline.Collection.extend({
  tableName: 'project',
  connection: 'myLocalDisk',

  attributes: {
    data: {
      collection: 'data',
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
});

var Data = Waterline.Collection.extend({
  tableName: 'data',
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
});

orm.loadCollection(User);
orm.loadCollection(Project);
orm.loadCollection(Data);

app.get('/add/:x/:y', function (req, res) {
  return res.json({
    x: parseInt(req.params.x), 
    y: parseInt(req.params.y),
    answer: Scheduler.add(parseInt(req.params.x), parseInt(req.params.y))
  });
});

app.get('/api/data/:id', function (req, res) {
  app.models.data.findOne({id: req.params.id}, function (err, model) {
    if (err) return res.status(500).json({err: err});
    fs.readFile(model.path, 'utf8', function (error, data) {
      return res.json({file: model, data: data});
    });
  });
});

app.post('/api/import-data', function (req, res) {
  var busboy = new Busboy({ headers: req.headers });

  var projectId;
  var projectObj = {};
  var dataList = { marker: {}, trait: {} };

  busboy.on('field', function (fieldname, val, fieldnameTruncated, 
                              valTruncated, encoding, mimetype) {
    switch (fieldname) {
      case "project":
        projectId = val;
        break;
      case "projectName":
        projectObj.name = val;
        break;
      case "markerName":
        dataList.marker.name = val;
        break;
      case "traitName":
        dataList.trait.name = val;
        break;
      case "species":
        projectObj.species = val;
        break;
      default:
        // console.log("Unhandled fieldname '" + fieldname + "' of value '" + val + "'");
    }
  });
  
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var fstream = fs.createWriteStream('./.tmp/' + filename);
    var data;
    file.pipe(fstream);
    (fieldname === "markerFile") ? data = dataList.marker : data = dataList.trait
    data.filetype = fieldname;
    data.path = filename;
  });
  busboy.on('finish', function () {
    app.models.project.findOrCreate(projectObj).then(function (project) {
      for (data in dataList) {
        dataList[data].project = project.id;
        app.models.data.create(dataList[data], function (err, dataModel) {});
      };
      return res.json(project);
    }).catch(function (err) {
      return res.status(500).json({err: err});
    });
  });

  req.pipe(busboy);
  
});

var getActivityRunning = function () {
  activityDb.get(1).then(function (doc) {
    return doc;
  });
};

var getActivityCompleted = function () {
  activityDb.get(1).then(function (doc) {
    return doc;
  });
};

var getActivityAll = function () {
  // var activityRunning = getActivityRunning();
  // var activityCompleted = getActivityCompleted();
  // var activityAll = Array.prototype.push.apply(activityRunning, activityAll);
  // return activityAll;
  return {title: "jobName", test: "yes"};
};

app.get('/api/activity/progress/:type', function (req, res) {
  switch (req.params.type) {
    case 'running':
      return res.json(getActivityRunning());
      break;
    case 'all':
      return res.json(getActivityAll());
      break;
    case 'completed':
      return res.json(getActivityCompleted());
      break;
    default:
      res.json({msg: "error"});
  }  
});

app.get('/api/activity/:id', function (req, res) {
  var progress = Scheduler.checkJob(id);
  return res.json();
});

app.post('/api/run-analysis', function (req, res) {
    console.log(req.body);
    /* 
    algorithmOptions = {
        type: algorithm_type,
        max_iteration: int (Number),
        tolerance: double (Number),
        learning_rate: double (Number)
    };
    algorithm_type = {
      proximal_gradient_descent: 1,
      iterative_update: 2
    };
    */
    var algorithmOptions = {
      type: req.body.algorithmType || 1,
      max_iteration: req.body.max_iteration || 10,
      tolerance: req.body.tolerance || 0.01,
      learning_rate: req.body.learning_rate || 0.01,
    };
    var algorithmId = Scheduler.newAlgorithm(algorithmOptions);
    if (algorithmId === -1) return res.json({msg: "error creating algorithm"});
    /* 
    modelOptions = {
      type: model_type,
    };
    model_type = {
      linear_regression: 1,
      lasso: 2,
      ada_multi_lasso: 3,
      gf_lasso: 4,
      multi_pop_lasso: 5,
      tree_lasso: 6
    };
    */
    var modelOptions = {
      type: req.body.modelType || 1,
    };
    var modelId = Scheduler.newModel(modelOptions);
    /*
    jobOptions = {
      algorithm_id: int,
      model_id: int,
    };
    */
    var jobId = Scheduler.newJob({algorithm_id: algorithmId, model_id: modelId});

    var handleResults = function(results) {
      console.log(results);
      // Handle results of async call here.
    }
    console.log(Scheduler.startJob(handleResults, jobId));
    console.log(Scheduler.checkJob(jobId));
    console.log(Scheduler.cancelJob(jobId));
    console.log(Scheduler.deleteAlgorithm(algorithmId));
    console.log(Scheduler.deleteModel(modelId));
    activityDb.put(job);
    return res.json({job: job});
});

app.get('/api/projects', function (req, res) {
  app.models.project.find().populate('data').exec(function (err, models) {
    if (err) return res.status(500).json({err: err});
    return res.json(models);
  });
});

app.get('/api/projects/:id', function (req, res) {
  app.models.project.findOne({id: req.params.id}).populate('data').exec(function (err, model) {
    if (err) return res.status(500).json({err: err});
    return res.json(model);
  });
});

app.get('/api/species', function (req, res) {
  return res.json([{name: "Human", id: 1}, {name: "Fly", id: 2}]);
});

app.get('/api/algorithms', function (req, res) {
  return res.json([{name: "Lasso", id: 0},
                   {name: "Multi Pop Lasso", id: 1},
                   {name: "GfLasso", id: 2},
                   {name: "Tree Lasso", id: 3},
                   {name: "Ada Multi Task Lasso", id: 4}                   
                  ]);
});

orm.initialize(waterlineConfig, function(err, models) {
  if(err) throw err;

  app.models = models.collections;
  app.connections = models.connections;

  console.log("Connected correctly to server.");
  var server = app.listen(3000, function () {

    var port = server.address().port || 'default port';
    console.log('Example app listening on port', port);
    
  });
});