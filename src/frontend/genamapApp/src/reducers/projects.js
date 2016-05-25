import { IMPORT_DATA_RECEIVE } from '../actions'

const project = (state, action) => {
  switch (action.type) {
    case IMPORT_DATA_RECEIVE:
      const project = action.data.project
      project.files = action.data.files
      return project
    // case RUN_ANALYSIS:
    //   return {
    //     id: action.id,
    //     text: action.text,
    //     completed: false
    //   }
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
    //
    // case RUN_ANALYSIS:
    //   return state.map((e, i) => e)
    //
    // case DELETE_PROJECT:
    //   return state.filter((e, i) => i !== action.index)
    //
    default:
      return state
  }
}

export default projects
