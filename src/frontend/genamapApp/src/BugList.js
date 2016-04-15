var React = require('react');
var ReactDOM = require('react-dom');
var Link = require('react-router').Link;

var BugAdd = require('./BugAdd');
var GetRequest = require('./Requests').GetRequest;
var PostRequest = require('./Requests').PostRequest;

var BugRow = React.createClass({
  render: function() {
    return (
      <tr>
        <td>
        <Link to={'/bugs/' + this.props.bug.id}>{this.props.bug.id}</Link>
        </td>
        <td className="mdl-data-table__cell--non-numeric">{this.props.bug.status}</td>
        <td>{this.props.bug.priority}</td>
        <td className="mdl-data-table__cell--non-numeric">{this.props.bug.owner}</td>
        <td className="mdl-data-table__cell--non-numeric">{this.props.bug.title}</td>
      </tr>
    );
  }
});

var BugTable = React.createClass({
  render: function() {
    var bugNodes = this.props.bugs.map(function (bug) {
      return (
        <BugRow key={bug.id} bug={bug} />
      );
    });
    return (
      <table className="mdl-data-table mdl-js-data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th className="mdl-data-table__cell--non-numeric">Status</th>
            <th>Priority</th>
            <th className="mdl-data-table__cell--non-numeric">Owner</th>
            <th className="mdl-data-table__cell--non-numeric">Title</th>
          </tr>
        </thead>
        <tbody>
          {bugNodes}
        </tbody>
      </table>
    );
  }
});

var BugList = React.createClass({
  getInitialState: function() {
    return {bugs: []};
  },
  componentDidMount: function() {
    this.loadData({});
  },
  loadData: function(filter) {
    GetRequest('/api/bugs', filter, (bugs) => {
      this.setState({bugs: bugs});
    });
  },
  addBug: function(bug) {
    PostRequest("/api/bugs", bug, (newBug) => {
      var bugsUpdated = this.state.bugs.concat(newBug);
      this.setState({bugs: bugsUpdated});
    });
  },
  render: function() {
    return (
      <div className="buglist">
        <h1>Bug Tracker</h1>
        <BugTable bugs={this.state.bugs} />
        <BugAdd addBug={this.addBug} />
      </div>
    );
  }
});

module.exports = BugList;