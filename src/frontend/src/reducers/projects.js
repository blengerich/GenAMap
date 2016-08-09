import { IMPORT_DATA_RECEIVE, LOAD_INITIAL_PROJECTS, DELETE_FILE, RECEIVE_ANALYSIS_RESULTS } from '../actions'

const addFilesToItems = (initialItems, files) => {
  var projectItems = initialItems
  files.forEach((file) => {
    // update project item files
    var newItem = projectItems[file.projectItem]
    if (!newItem)
      newItem = { files: [file], data: {}, name: file.projectItem }
    else
      newItem.files.push(file)

    // set project item type
    switch (file.filetype) {
      case 'markerFile':
        newItem.type = 'marker'
        newItem.data.id = file.id
        break
      case 'markerLabelFile':
        newItem.data.labelId = file.id
        break
      case 'traitFile':
        newItem.type = 'trait'
        newItem.data.id = file.id
        break
      case 'traitLabelFile':
        newItem.data.labelId = file.id
        break
      case 'snpsFeatureFile':
        newItem.type = 'snpsFeature'
        break
      case 'resultFile':
        newItem.type = 'result'
        break
      default:
        break
    }

    projectItems[file.projectItem] = newItem
  })
  return projectItems
}

const initialProject = {
  files: [],
  items: {}
}

const project = (state = initialProject, action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
      const project = action.data.project
      project.files = state.files.concat(action.data.files)
      /*project.markers = addOrReplace(state.markers, action.data.marker, 'name')
      project.traits = addOrReplace(state.traits, action.data.trait, 'name')
      project.snpsFeatures = addOrReplace(state.snpsFeatures, action.data.snpsFeature, 'name')
      project.populations = addOrReplace(state.populations, action.data.population, 'name')*/
      project.items = Object.assign({}, state.items, addFilesToItems({}, action.data.files))
      return project
    case DELETE_FILE:
      const updatedFiles = state.files.filter(file => file.id !== action.data.file)
      const itemWithoutFile = state.items[action.data.projectItem]
      itemWithoutFile.files = itemWithoutFile.files.filter(file => file.id !== action.data.file)

      itemWithoutFile.files.length ?
        (state.items[action.data.projectItem] = itemWithoutFile)
      : (delete state.items[action.data.projectItem])
      
      return Object.assign({}, state, { files: updatedFiles })
    case RECEIVE_ANALYSIS_RESULTS:
      const filesWithResults = state.files.concat(action.data.files)
      const itemsWithResults = addFilesToItems(state.items, action.data.files)
      return Object.assign({}, state, { files: filesWithResults, items: itemsWithResults })
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
        return (p.id === action.data.project)
          ? project(p, action)
          : p
      })
    case RECEIVE_ANALYSIS_RESULTS:
      return state.map(p => {
        return (p.id === action.data.project)
          ? project(p, action)
          : p
      })
    default:
      return state
  }
}

export default projects
