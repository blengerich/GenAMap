import { IMPORT_DATA_RECEIVE, LOAD_INITIAL_PROJECTS, DELETE_FILE } from '../actions'

const project = (state, action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
      const project = action.data.project
      project.files = action.data.files
      return project
    case DELETE_FILE:
      const updatedFiles = state.files.filter(file => file.id !== action.file)
      return Object.assign({}, state, { files: updatedFiles })
    default:
      return state
  }
}

const projects = (state = [], action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
      return [
        ...state,
        project(undefined, action)
      ]
    case LOAD_INITIAL_PROJECTS:
      return action.data
    case DELETE_FILE:
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
