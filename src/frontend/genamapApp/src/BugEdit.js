var React = require('react');
var ReactDOM = require('react-dom');
var Link = require('react-router').Link;

var GetRequest = require('./Requests').GetRequest;
var PutRequest = require('./Requests').PutRequest;

var BugEdit = React.createClass({
  componentDidMount: function() {
    this.loadData();
  },
  loadData: function () {
    GetRequest('/api/bugs/' + this.props.params.id, {}, (bug) => {
      this.setState(bug);
    });
  },
  submit: function (event) {
    event.preventDefault();
    var editedBug = {
      priority: this.state.priority,
      status: this.state.status,
      owner: this.state.owner,
      title: this.state.title
    }
    PutRequest('api/bugs/' + this.props.params.id, editedBug, (updatedBug) => {
      this.setState(updatedBug);
    });
  },
  getInitialState: function() {
    return {};
  },
  onChangePriority: function(event) {
    this.setState({priority: event.target.value});
  },
  onChangeStatus: function(event) {
    this.setState({status: event.target.value});
  },
  onChangeTitle: function(event) {
    this.setState({title: event.target.value});
  },
  onChangeOwner: function(event) {
    this.setState({owner: event.target.value});
  },
  render: function() {
    return (
      <div>
        <h3>Edit Bug: {this.props.params.id}</h3>
        <form name="bugEdit" onSubmit={this.submit}>
          Title:
          <input type="text" name="title" value={this.state.title} onChange={this.onChangeTitle} />
          <br/>
          Owner:
          <input type="text" name="owner" value={this.state.owner} onChange={this.onChangeOwner} />
          <br/>
          Priority:

          <select value={this.state.priority} onChange={this.onChangePriority}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <br/>
          Status:
          <select value={this.state.status} onChange={this.onChangeStatus}>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <button type="submit"><Link to="/bugs">Update and Return to bug list</Link></button>
        </form>
      </div>
    );
  }
});

module.exports = BugEdit