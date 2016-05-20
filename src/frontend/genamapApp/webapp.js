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

var guid = function () {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var s4 = function () {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

/*app.get('/add/:x/:y', function (req, res) {
  return res.json({
    x: parseInt(req.params.x), 
    y: parseInt(req.params.y),
    answer: Scheduler.add(parseInt(req.params.x), parseInt(req.params.y))
  });
});*/

app.get('/api/data/:id', function (req, res) {
  app.models.data.findOne({id: req.params.id}, function (err, model) {
    if (err) return res.status(500).json({err: err});
    fs.readFile(model.path, 'utf8', function (error, data) {
      console.log("model:", model);
      console.log("data:", data);
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
        console.log("Unhandled fieldname '" + fieldname + "' of value '" + val + "'");
    }
  });
  
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    var id = guid();
    var fstream = fs.createWriteStream('./.tmp/' + id + '.csv');
    var data;
    file.pipe(fstream);
    (fieldname === "markerFile") ? data = dataList.marker : data = dataList.trait
    data.filetype = fieldname;
    data.path = './.tmp/' + id + '.csv';
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

var ddoc = {
  _id: '_design/activity_index',
  views: {
    running: {
      map: function (doc) { emit(doc.status < 100); }.toString()
    },
    completed: {
      map: function (doc) { emit(100 <= doc.status); }.toString()
    }
  }
};

activityDb.put(ddoc).then(function () {
  console.log("success");
}).catch(function (error) {
  console.log("error: ", error);
});

var getActivityRunning = function () {
  activityDb.query('activity_index/running').then(function (res) {
    console.log("query results: ", res);
    return res;
  }).catch(function (error) {
    console.log("Error: ", error);
  });
};

var getActivityCompleted = function () {
  activityDb.query('activity_index/completed').then(function (res) {
    return res;
  }).catch(function (error) {
    console.log("Error: ", error);
  });
};

var getActivityAll = function () {
  activityDb.allDocs({
    include_docs: true,
    attachments: true
  }).then(function (result) {
    return result;
  }).catch(function (err) {
    console.log(err);
  });
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
  return res.json({status: Scheduler.checkJob(id)});
});

var getAlgorithmType = function (id) {
  var algorithmTypes = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1
  };
  return algorithmTypes[id];
};

app.post('/api/run-analysis', function (req, res) {
  req.body.algorithms.forEach( (model) => {
    // should be getting the Model ID here, then we can call API for data paths
    /*app.get('/api/data/:id', function (req, res)*/
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
      type: req.body.algorithmType || getAlgorithmType(model.id) || 1,
      options: {
        //max_iteration: req.body.max_iteration || 10,
        tolerance: req.body.tolerance || 0.01,
        learning_rate: req.body.learning_rate || 0.01,  
      }    
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
      type: model.id || 1,
      options: {
        lambda: model.lambda || 0.05,
        L2_lambda: model.L2_lambda || 0.01
      }
    };
    var modelId = Scheduler.newModel(modelOptions);
    if (modelId === -1) return res.json({msg: "error creating model"});
    
	fs.readFile(model.path, 'utf8', function (error, data) {
      console.log("data:", data);
  	/*return res.json({file: model, data: data});*/
	});

    /* TODO:Set X and Y here */
    console.log(Scheduler.setX(modelId, [[0, 1],[1, 1]]));
    console.log(Scheduler.setY(modelId, [[0], [1]]));
    
    /*
    jobOptions = {
      algorithm_id: int,
      model_id: int,
    };
    */
    var jobId = Scheduler.newJob({algorithm_id: algorithmId, model_id: modelId});

    console.log("starting job")
    Scheduler.startJob(jobId, (results) => {
      console.log("results: ", results);
      activityDb.put(results);
    });
    // console.log(Scheduler.checkJob(jobId));
    // console.log(Scheduler.cancelJob(jobId));
    // console.log(Scheduler.deleteAlgorithm(algorithmId));
    // console.log(Scheduler.deleteModel(modelId));
  });
  return res.json({status: true});
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
  /*
  model_type = {
    linear_regression: 1,
    lasso: 2,
    ada_multi_lasso: 3,
    gf_lasso: 4,
    multi_pop_lasso: 5,
    tree_lasso: 6
  };
  */
  return res.json([{name: "Linear Regression", id: 1},
                   /*{name: "Lasso", id: 2},
                   {name: "Ada Multi Lasso", id: 3},
                   {name: "GF Lasso", id: 4},
                   {name: "Multi Pop Lasso": 5},
                   {name: "Tree Lasso", id: 6}*/
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