import { combineReducers } from 'redux'

import activities from './activities'
import auth from './auth'
import projects from './projects'
import ui from './ui'

const genamapReducer = combineReducers({
  activities,
  auth,
  projects,
  ui
})

export default genamapReducer
