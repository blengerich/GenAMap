import React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import { requireAuthentication } from '../components/AuthenticatedComponent'
import GMAppContainer from './GMAppContainer'
import GMDataListContainer from './GMDataListContainer'
import GMMatrixVisualizationContainer from './GMMatrixVisualizationContainer'
import LoginContainer from './LoginContainer'

const App = () => (
  <Router history={browserHistory}>
    <Route path='/' component={requireAuthentication(GMAppContainer)}>
      <Route path='login' component={LoginContainer} />
      <Route path='data/:id' component={requireAuthentication(GMDataListContainer)} />
      <Route path='visualization/matrix' component={requireAuthentication(GMMatrixVisualizationContainer)} />
    </Route>
  </Router>
)

export default App
