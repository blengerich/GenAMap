import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import thunk from 'redux-thunk'
import DevTools from '../components/DevTools'

import genamapReducer from '../reducers'

const reducers = combineReducers({
  ...genamapReducer,
  routing: routerReducer
})

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunk, routerMiddleware(browserHistory)),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
)

export default function configureStore (initialState) {
  return createStore(reducers, initialState, enhancer)
}
