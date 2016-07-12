import React from 'react'
import D3Chart from './D3Chart'
import GMMatrixToolbar from './GMMatrixToolbar'

import fetch from './fetch'
import config from '../../config'

const GMMatrixVisualization = React.createClass({
  componentDidMount() {
    this.setState({ resultId: this.props.params.id })
  },
  componentWillReceiveProps(nextProps) {
    this.setState({ resultId: nextProps.params.id })
  },
  getInitialState() {
    return {
      correlationThreshold: 0.0,
      zoomEnabled: true
    }
  },
  onThresholdChange(event, value) {
    this.setState({
      correlationThreshold: value
    });
  },
  subsetSelector(event) {
    this.setState({
      zoomEnabled: !this.state.zoomEnabled
    });
  },
  render: function () {
    return (
      <div>
        <div className="Matrix">
          <D3Chart
            resultId={this.state.resultId}
            threshold={this.state.correlationThreshold}
            zoom={this.state.zoomEnabled}
          />
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
