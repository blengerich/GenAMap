import { combineReducers } from 'redux'

import ui from './ui'
import userData from './userData'

const genamapReducer = combineReducers({
  ui,
  userData
})

export default genamapReducer
