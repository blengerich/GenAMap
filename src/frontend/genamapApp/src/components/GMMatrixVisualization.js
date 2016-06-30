import React from 'react'
import D3Chart from './D3Chart'
import GMMatrixToolbar from './GMMatrixToolbar'

const GMMatrixVisualization = React.createClass({
  getInitialState() {
    return {
      correlationThreshold: 0.0
    }
  },
  onThresholdChange(event, value) {
    this.setState({
      correlationThreshold: value
    });
  },
  render: function () {
    return (
      <div>
        <div className="Matrix">
          <D3Chart threshold={this.state.correlationThreshold} />
        </div>
        <GMMatrixToolbar
          left={this.props.minPad}
          right={this.props.minPad}
          slider={{"onThresholdChange": this.onThresholdChange}}
        />
      </div>
    )
  }
})

export default GMMatrixVisualization
