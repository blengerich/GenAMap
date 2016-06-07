var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var Redirect = require('react-router').Redirect;
var hashHistory = require('react-router').hashHistory;
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var GMApp = require('./GMApp');
var DataList = require('./DataList');
var BugList = require('./BugList');
var GMMatrixVisualization = require('./GMMatrixVisualization')

var NoMatch = React.createClass({
  render: function() {
    return (
      <h2>No match for the route</h2>
    );
  }
});

ReactDOM.render(
  (
    <Router history={hashHistory}>
      <Route path="/" component={GMApp}>
        <Route path="/" component={DataList} />
        <Route path="/data/:id" component={DataList} />
        <Route path="/visualization/matrix/:id" component={GMMatrixVisualization} />
        <Route path="*" component={NoMatch} />
      </Route>
    </Router>
  ),
  document.getElementById('gm-app')
);
