var React = require('react');

var D3Chart = require('./d3Chart');
var GMMatrixToolbar = require('./GMMatrixToolbar');

var GMMatrixVisualization = React.createClass({
    componentDidMount() {
        console.log(this.props);
    },

  render: function () {
    return (
      <div>
        <GMMatrixToolbar
          left={this.props.left - this.props.minPad}
          right={this.props.right - this.props.minPad}
        />
        <div className="Matrix">
            <D3Chart/>
        </div>
      </div>
    );
  }
});

module.exports = GMMatrixVisualization;
