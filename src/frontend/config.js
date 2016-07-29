const config = {
  secret: 'VReLsDLsyAKYPFL69IQp2KYvguj8E3eNdbt0a9UkhGB5xrBXeJYwFYAx2kAsW',
  api: {
    projectUrl: '/api/projects',
    speciesUrl: '/api/species',
    algorithmUrl: '/api/algorithms',
    importDataUrl: '/api/import-data',
    runAnalysisUrl: '/api/run-analysis',
    dataUrl: '/api/data',
    initialStateUrl: '/api/projects',
    loginUrl: '/login',
    saveUrl: '/api/save',
    createSessionUrl: '/sessions/create',
    createAccountUrl: '/user/create',
    getActivityUrl: '/activity',
    cancelJobUrl: '/api/cancelJob',
    getAnalysisResultsUrl: '/analysis-results'
  },
  ui: {
    navWidth: 300,
    minPad: 24,
    baseColor: '#5bc8df',
    accentColor: '#fc5522'
  },
  species: [{
    name: 'Human'
  }, {
    name: 'None'
  }, {
    name: 'Fly'
  }],
  algorithms: [{ 
    id: 0,
    name: 'Brent Search',
    image: '',
    info: 'info about Brent Search'
  }, {
    id: 1,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }, {
    id: 2,
    name: 'Grid Search',
    image: 'images/grid_search.png',
    info: 'info about Grid Search'
  }, {
    id: 3,
    name: 'Iterative Update',
    image: '',
    info: 'info about IU'
  }],
  algorithmsByModel: {
  0 : [// Linear Regression 
    1 // Proximal Gradient Descent
  ],
  1 : [// Lasso // TODO: is lasso abstract? 
    1 // Proximal Gradient Descent
  ],
  2 : [ //AdaMultiLasso
    1 // Proximal Gradient Descent
  ],
  3 : [ // Gflasso
    1 // Proximal Gradient Descent
  ],
  4 : [ // MultiPopLasso
    1 // Proximal Gradient Descent
  ],
  5 : [// Tree Lasso
    3, // Iterative Update
    1  // Proximal Gradient Descent
  ],
  },
  models: [{
    id: 0,
    name: 'Linear Regression',
    image: '',
    info: 'info about Linear Regression'
  }, {
    id: 1,
    name: 'Lasso',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }, {
    id: 2,
    name: 'Adaptive Multi-Task Lasso',
    image: 'images/grid_search.png',
    info: 'info about Grid Search'
  }, {
    id: 3,
    name: 'GfLasso',
    image: '',
    info: 'info about IU'
  }, {
    id: 4,
    name: 'Multi-Population Lasso',
    image: '',
    info: 'info about IU'
  }, {
    id: 5,
    name: 'Tree Lasso',
    image: '',
    info: 'info about IU'
  }]
}

module.exports = config
