const config = {
  api: {
    projectUrl: '/api/projects',
    speciesUrl: '/api/species',
    algorithmUrl: '/api/algorithms',
    importDataUrl: '/api/import-data',
    runAnalysisUrl: '/api/run-analysis',
    dataUrl: '/api/data/',
    initialStateUrl: '/api/projects'
  },
  ui: {
    navWidth: 300,
    minPad: 24,
    baseColor: '#5bc8df',
    accentColor: '#fc5522'
  },
  species: [
    {
      name: 'Human'
    },
    {
      name: 'None'
    },
    {
      name: 'Fly'
    }
  ]
}

export default config
