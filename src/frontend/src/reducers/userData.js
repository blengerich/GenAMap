import { combineReducers } from 'redux'

import activities from './activities'
import auth from './auth'
import projects from './projects'

const userData = combineReducers({
  activities,
  auth,
  projects
})

export default userData
