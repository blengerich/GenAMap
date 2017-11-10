const config = {
  secret: 'VReLsDLsyAKYPFL69IQp2KYvguj8E3eNdbt0a9UkhGB5xrBXeJYwFYAx2kAsW',
  pg: '!!GeNaMaPnew00',
  serverPort: '54.191.129.39',
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
    ForgetPasswordUrl: '/user/forget-password',
    ForgetPasswordEmailUrl: '/user/forget-password-email',
    confirmAccountUrl: '/user/verify',
    requestUserConfirmUrl: '/user/request-confirm',
    getActivityUrl: '/activity',
    cancelJobUrl: '/api/cancelJob',
    getAnalysisResultsUrl: '/analysis-results',
    ChangePasswordUrl: '/user/change-password',
    read_filelist:'/api/read_filelist/'
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
  }, {
    id: 4,
    name: 'Hypothesis Testing',
    image: '',
    info: 'info about Hypothesis Testing'
  }],
  algorithmsByModel: {
  0 : [// Linear Regression
    1 // Proximal Gradient Descent
  ],
  1 : [ //AdaMultiLasso
    1 // Proximal Gradient Descent
  ],
  2 : [ // Gflasso
    1 // Proximal Gradient Descent
  ],
  3 : [ // MultiPopLasso
    1 // Proximal Gradient Descent
  ],
  4 : [// Tree Lasso
    1  // Proximal Gradient Descent
  ],
  5 : [// Fisher Exact
    4  // hypo
  ],
  6 : [// Chi2
    4  // hypo
  ],
  7 : [// Wald
    4  // hypo
  ],
  8 : [// lmm
    0  // brent search
  ],
  9 : [// slmm
    1  // Proximal Gradient Descent
  ],
  },
  Structuremodels: [{
    id: 0,
    name: 'Linear Regression',
    image: '',
    info: 'info about Linear Regression'
  },
  //     {
  //   id: 1,
  //   name: 'Adaptive Multi-Task Lasso',
  //   image: 'images/grid_search.png',
  //   info: 'info about Grid Search'
  // }, {
  //   id: 2,
  //   name: 'GfLasso',
  //   image: '',
  //   info: 'info about IU'
  // }, {
  //   id: 3,
  //   name: 'Multi-Population Lasso',
  //   image: '',
  //   info: 'info about IU'
  // },
      {
    id: 4,
    name: 'Tree Lasso',
    image: '',
    info: 'info about IU'
  }],

  Hypomodels: [
  //     {
  //   id: 5,
  //   name: 'Fisher Exact Test',
  //   image: '',
  //   info: 'info about Fisher Exact Test'
  // },
  {
    id: 6,
    name: 'Chi-squared Test',
    image: 'images/grid_search.png',
    info: 'Chi-squared Test'
  }, {
    id: 7,
    name: 'Wald Test',
    image: '',
    info: 'info about Wald Test'
  }],
  Confoundingmodels: [{
    id: 8,
    name: 'LMM',
    image: '',
    info: 'info about LMM'
  }, {
    id: 9,
    name: 'sparse LMM',
    image: 'images/grid_search.png',
    info: 'sparse LMM'
  }]
}

module.exports = config
