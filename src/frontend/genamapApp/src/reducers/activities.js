import { ADD_ACTIVITY, RUN_ANALYSIS, DELETE_PROJECT,
         CANCEL_ACTIVITY, PAUSE_ACTIVITY, RECEIVE_UPDATE_ACTIVITY,
         LOAD_INITIAL_ACTIVITIES } from '../actions'

const activity = (state, action) => {
  switch (action.type) {
    case ADD_ACTIVITY:
      return {
        id: action.id,
        text: action.text,
        completed: false,
        progress: 0.0,
        status: 'running'
      }
    case RECEIVE_UPDATE_ACTIVITY:
      if (action.response.progress == -1) {
        // TODO: read from temp file
        return {
          id: action.id,
          text: action.text,
          completed: true,
          progress: 1.0,
          status: 'completed'
        }
      } else {
        return {
          id: action.id,
          text: action.text,
          completed: false,
          progress: action.response.progress,
          status: 'running'
        }
      }
    default:
      return state
  }
}

const activities = (state = [], action) => {
  switch (action.type) {
    case CANCEL_ACTIVITY:
      return state.filter((a) => a.id !== action.id)
    case PAUSE_ACTIVITY:
      return state.map((a) => {
        if (a.id === action.id) {
          return Object.assign({}, a, {
            status: 'paused'
          })
        }
        return a
      })
    case ADD_ACTIVITY:
      return [
        ...state,
        activity(undefined, action)
      ]
    case RECEIVE_UPDATE_ACTIVITY:
      return state.map((a) => {
        return (a.id == action.id) ? activity(undefined, action) : (a)
      })
    case RUN_ANALYSIS:
      return state.map((e, i) => e)
    case DELETE_PROJECT:
      return state.filter((e, i) => i !== action.index)
    case LOAD_INITIAL_ACTIVITIES:
      return action.data
    default:
      return state
  }
}

export default activities
