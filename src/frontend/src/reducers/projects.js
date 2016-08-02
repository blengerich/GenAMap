import { IMPORT_DATA_RECEIVE, LOAD_INITIAL_PROJECTS, DELETE_FILE, RECEIVE_ANALYSIS_RESULTS } from '../actions'

const addOrReplace = (arr, e, field) => {
  if (!e || !e.id)
    return arr

  if (arr.every (p => p[field] !== e[field])) {
    return [...arr, e]
  } else {
    return arr.map(p => {
      return (p[field] === e[field]) ? e : p
    })
  }
}

const initialProject = {
  files: [],
  markers: [],
  traits: [],
  snpsFeatures: []
}

const project = (state = initialProject, action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
    console.log(action.data)
      const project = action.data.project
      project.files = state.files.concat(action.data.files)
      project.markers = addOrReplace(state.markers, action.data.marker, 'name')
      project.traits = addOrReplace(state.traits, action.data.trait, 'name')
      project.snpsFeatures = addOrReplace(state.snpsFeatures, action.data.snpsFeature, 'name')
      return project
    case DELETE_FILE:
      const updatedFiles = state.files.filter(file => file.id !== action.file)
      return Object.assign({}, state, { files: updatedFiles })
    case RECEIVE_ANALYSIS_RESULTS:
      const withResultFile = [...state.files, action.file]
      return Object.assign({}, state, { files: withResultFile })
    default:
      return state
  }
}

const projects = (state = [], action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
      if (state.every(p => p.id !== action.data.project.id)) {
        return [
          ...state,
          project(undefined, action)
        ]
      } else {
        return state.map(p => {
          return (p.id === action.data.project.id)
          ? project(p, action)
          : p
        })
      }
    case LOAD_INITIAL_PROJECTS:
      return action.data
    case DELETE_FILE:
      return state.map(p => {
        return (p.id === action.project)
          ? project(p, action)
          : p
      })
    case RECEIVE_ANALYSIS_RESULTS:
      return state.map(p => {
        return (p.id === action.project)
          ? project(p, action)
          : p
      })
    default:
      return state
  }
}

export default projects
