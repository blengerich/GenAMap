var React = require('react');

var D3Chart = require('./d3Chart');
var GMMatrixToolbar = require('./GMMatrixToolbar');

var GMMatrixVisualization = React.createClass({
  render: function () {
    return (
      <div>
        <div className="Matrix">
            <div id="chart">
                <D3Chart/>
            </div>
        </div>
        <GMMatrixToolbar 
          left={this.props.left - this.props.minPad} 
          right={this.props.right - this.props.minPad}
        />
      </div>
    );
  }
});

module.exports = GMMatrixVisualization;