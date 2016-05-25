import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store/configureStore'
import App from './components/App'

// import { GetRequest } from './components/Requests'
// import config from '../config'

// function getInitialState () {
  // GetRequest(config.api.initialStateUrl, {}, (response) => {
    // return {projects: response}
  // })
// }
// const initialState = getInitialState()

const store = configureStore()

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('gm-app')
)
