import React from 'react'
import D3Chart from './D3Chart'
import GMMatrixToolbar from './GMMatrixToolbar'

import fetch from './fetch'
import config from '../../config'

const GMMatrixVisualization = React.createClass({
  componentDidMount() {
    this.loadData(this.props.params)
  },
  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps.params)
  },
  getInitialState() {
    return {
      correlationThreshold: 0.0,
      zoomEnabled: true
    }
  },
  loadData: function (params) {
    let dataRequest = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return fetch(`${config.api.dataUrl}/${params.resultId}`, dataRequest)
    .then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      this.setState({ data: JSON.parse(json.data) })
      return fetch(`${config.api.dataUrl}/${params.markerLabelId}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      this.setState({ markerLabels: json.data.split('\n').filter(line => line.length > 0) })
      return fetch(`${config.api.dataUrl}/${params.traitLabelId}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      this.setState({ traitLabels: json.data.split('\n').filter(line => line.length > 0) })
      return json
    }).catch(err => console.log(err))

  },
  loadLabels: function(id) {
    let labelRequest = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    fetch(`${config.api.dataUrl}/${id}`, labelRequest)
    .then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      const data = json.data.split('\n')
      return data
    }).catch(err => console.log('Error: ', err))
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
            data={this.state.data}
            markerLabels={this.state.markerLabels}
            traitLabels={this.state.traitLabels}
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
