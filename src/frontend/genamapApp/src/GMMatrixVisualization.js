var React = require('react');

var GMMatrixToolbar = require('./GMMatrixToolbar');

var GMMatrixVisualization = React.createClass({
  render: function () {
    return (
      <div>
        <p>Put your HTML here</p>
        <GMMatrixToolbar 
          left={this.props.left - this.props.minPad} 
          right={this.props.right - this.props.minPad}
        />
      </div>
    );
  }
});

module.exports = GMMatrixVisualization;