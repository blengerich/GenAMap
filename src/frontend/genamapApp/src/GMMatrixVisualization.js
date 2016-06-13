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
            <div className="buttonContainer">
                <li className="zoomButton">
                    <a id="zoom-in" data-zoom="+1">
                        Zoom In
                    </a>
                </li>
                <li className="zoomButton">
                    <a id="zoom-out" data-zoom="-1">
                        Zoom Out
                    </a>
                </li>
                <li className="zoomButton">
                    <a id="reset" data-zoom="-8">
                        Reset
                    </a>
                </li>
            </div>
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
