var React = require('react');
var ReactDOM = require('react-dom');

var BugFilter = React.createClass({
  submit: function (event) {
    this.props.submitHandler({priority: this.state.priority, status: this.state.status});
  },
  getInitialState: function () {
    return {priority: "", status: ""};
  },
  onChangePriority: function (event) {
    this.setState({priority: event.target.value});
  },
  onChangeStatus: function (event) {
    this.setState({status: event.target.value});
  },
  render: function() {
    return (
      <div>
        <h3>Filter</h3>
        Priority:
        <select value={this.state.priority} onChange={this.onChangePriority}>
          <option value="">(Any)</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
        <br/>
        Status:
        <select value={this.state.status} onChange={this.onChangeStatus}>
          <option value="">(Any)</option>
          <option value="New">New</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        <br/>
        <button className="filterSubmit" onClick={this.submit}>Filter</button>
      </div>
    );
  }
});

module.exports = BugFilter;