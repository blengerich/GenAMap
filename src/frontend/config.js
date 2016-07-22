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
    id: 1,
    name: 'Brent Search',
    image: '',
    info: 'info about Brent Search'
  }, {
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }, {
    id: 3,
    name: 'Grid Search',
    image: 'images/grid_search.png',
    info: 'info about Grid Search'
  }, {
    id: 4,
    name: 'Iterative Update',
    image: '',
    info: 'info about IU'
  }],
  algorithmsByModel: {
  1 : [// Linear Regression 
  {id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  2 : [// Lasso
  { // TODO: is lasso abstract? 
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  3 : [ //AdaMultiLasso
  { 
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  4 : [ // Gflasso
  {
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  5 : [ // MultiPopLasso
  {
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  6 : [// Tree Lasso
  {
    id: 4,
    name: 'Iterative Update',
    image: '',
    info: 'info about IU'
  },
  {
    id: 2,
    name: 'Proximal Gradient Descent',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }],
  },
  models: [{
    id: 1,
    name: 'Linear Regression',
    image: '',
    info: 'info about Linear Regression'
  }, {
    id: 2,
    name: 'Lasso',
    image: 'images/proximal_gradient_descent.png',
    info: 'info about PGD'
  }, {
    id: 3,
    name: 'AdaMultiLasso',
    image: 'images/grid_search.png',
    info: 'info about Grid Search'
  }, {
    id: 4,
    name: 'GfLasso',
    image: '',
    info: 'info about IU'
  }, {
    id: 5,
    name: 'Multi-Population Lasso',
    image: '',
    info: 'info about IU'
  }, {
    id: 6,
    name: 'Tree Lasso',
    image: '',
    info: 'info about IU'
  }]
}

module.exports = config
