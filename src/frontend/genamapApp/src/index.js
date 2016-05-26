import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import configureStore from './store/configureStore'
import { requireAuthentication } from './components/AuthenticatedComponent'
import GMAppContainer from './components/GMAppContainer'
import GMDataList from './components/GMDataList'
import GMMatrixVisualization from './components/GMMatrixVisualization'
import GMLoginContainer from './components/GMLoginContainer'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/login' component={GMLoginContainer} />
      <Route path='/' component={requireAuthentication(GMAppContainer)}>
        <Route path='data/:id' component={GMDataList} />
        <Route path='visualization/matrix' component={GMMatrixVisualization} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('gm-app')
)
