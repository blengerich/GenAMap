var React = require('react');
var FloatingActionButton = require('material-ui/lib/floating-action-button');
var D3Chart = require('./d3Chart');
var GMMatrixToolbar = require('./GMMatrixToolbar');

var GMMatrixVisualization = React.createClass({
  render: function () {
    return (
      <div>
        <div className="Matrix">
          <D3Chart />
        </div>
        <GMMatrixToolbar
          left={this.props.minPad}
          right={this.props.minPad}
        />
      </div>
    );
  }
});

module.exports = GMMatrixVisualization;
