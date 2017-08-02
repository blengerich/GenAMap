import { createStore, applyMiddleware, compose } from 'redux'
import persistState from 'redux-localstorage'
import thunk from 'redux-thunk'
import DevTools from '../components/DevTools'

import genamapReducer from '../reducers'
import saver from '../middleware'

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunk, saver),
  // To persist store in browser LocalStorage
  persistState("userData"),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument(),

)

export default function configureStore (initialState) {
  return createStore(genamapReducer, initialState, enhancer)
}
