import jwt from 'jsonwebtoken'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { AppContainer } from 'react-hot-loader';

injectTapEventPlugin()

import configureStore from './store/configureStore'
import { requireAuthentication } from './components/AuthenticatedComponent'
import { addDevTools } from './components/WithDevTools'
import GMAppContainer from './components/GMAppContainer'
import GMDataList from './components/GMDataList'
// import GMMatrixVisualization from './components/GMMatrixVisualization'
import GMManhattanVisualization from './components/GMManhattanVisualization'
import GMDendrogramVisualization from './components/GMDendrogramVisualization'
import GMErrorPage from './components/GMErrorPage'
import GMLoginContainer from './components/GMLoginContainer'
import GMForgetPasswordContainer from './components/GMForgetPasswordContainer'
import GMCreateAccountContainer from './components/GMCreateAccountContainer'
import { setInitialUserState, confirmAccountFromLink } from './actions'
import { getToken, verifyToken, removeToken } from './middleware/token'
import GMMatrixVisualization2 from './components/GMMatrixVisualization2'

const store = configureStore(window.localStorage.getItem('redux') || {})

const token = getToken()
verifyToken(token) ? store.dispatch(setInitialUserState(token)) : removeToken()

function confirmUser (nextState, replace) {
  store.dispatch(confirmAccountFromLink({ code: nextState.params.id }))
}

render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/login' component={addDevTools(GMLoginContainer)} />
      <Route path='/register' component={addDevTools(GMCreateAccountContainer)} />
      <Route path='/forget-password' component={addDevTools(GMForgetPasswordContainer)} />
      <Route path='/confirm/:id' onEnter={confirmUser} />
      <Route path='/error/:name' component={GMErrorPage} />
      <Route path='/' component={addDevTools(requireAuthentication(GMAppContainer))}>
        <Route path='data/:id' component={GMDataList} />
        <Route path='visualization/matrix/:marker/:trait/:result' component={GMMatrixVisualization2} />
        <Route path='visualization/manhattan/:markers/:traits/:results/:traitNum' component={GMManhattanVisualization} />
        <Route path='visualization/dendrogram/:markers/:traits/:results/:tree1/:tree2' component={GMDendrogramVisualization} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('gm-app')
)
