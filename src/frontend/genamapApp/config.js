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
    name: 'algorithm1',
    image: 'https://goo.gl/CKW3lw',
    info: 'info about algorithm1'
  }, {
    id: 2,
    name: 'algorithm2',
    image: 'https://goo.gl/CKW3lw',
    info: 'info about algorithm2'
  }]
}

module.exports = config
