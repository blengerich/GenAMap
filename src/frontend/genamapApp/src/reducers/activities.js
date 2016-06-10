import { ADD_ACTIVITY, RUN_ANALYSIS, DELETE_PROJECT,
         CANCEL_ACTIVITY, PAUSE_ACTIVITY, LOAD_INITIAL_ACTIVITIES } from '../actions'

const activity = (state, action) => {
  switch (action.type) {
    case RUN_ANALYSIS:
      return {
        id: action.id,
        text: action.text,
        completed: false,
        status: 'running'
      }
    default:
      return state
  }
}

const activities = (state = [], action) => {
  switch (action.type) {
    case CANCEL_ACTIVITY:
      return state.filter((a) => a.id !== action.activity)
    case PAUSE_ACTIVITY:
      return state.map((a) => {
        if (a.id === action.activity) {
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
    case RUN_ANALYSIS:
      return state.map((e, i) => e)
    case DELETE_PROJECT:
      return state.filter((e, i) => i !== action.index)
    case LOAD_INITIAL_ACTIVITIES:
      console.log("reducing activity data", action.data)
      return action.data
    default:
      return state
  }
}

export default activities
