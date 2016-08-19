import jwt from 'jsonwebtoken'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()

import configureStore from './store/configureStore'
import { requireAuthentication } from './components/AuthenticatedComponent'
import { addDevTools } from './components/WithDevTools'
import GMAppContainer from './components/GMAppContainer'
import GMDataList from './components/GMDataList'
import GMMatrixVisualization from './components/GMMatrixVisualization'
import GMManhattanVisualization from './components/GMManhattanVisualization'
import GMLoginContainer from './components/GMLoginContainer'
import { setInitialUserState } from './actions'
import { getToken, verifyToken, removeToken } from './middleware/token'

const store = configureStore()

const token = getToken()
verifyToken(token) ? store.dispatch(setInitialUserState(token)) : removeToken()

render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/login' component={addDevTools(GMLoginContainer)} />
      <Route path='/' component={addDevTools(requireAuthentication(GMAppContainer))}>
        <Route path='data/:id' component={GMDataList} />
        <Route path='visualization/matrix/:marker/:trait/:result' component={GMMatrixVisualization} />
        <Route path='visualization/manhattan' component={GMManhattanVisualization} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('gm-app')
)
