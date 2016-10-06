import React from 'react'
import GMMatrixChart from './GMMatrixChart'
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
    const vizData = { }
    return fetch(`${config.api.dataUrl}/${params.result}`, dataRequest)
    .then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.data = JSON.parse(json.data)
      this.setState({ data: JSON.parse(json.data) })
      return fetch(`${config.api.dataUrl}/${params.marker}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.markerLabels = json.data.split('\n').filter(line => line.length > 0)
      return fetch(`${config.api.dataUrl}/${params.trait}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.traitLabels = json.data.split('\n').filter(line => line.length > 0)
      this.setState({
        data: vizData.data,
        markerLabels: vizData.markerLabels,
        traitLabels: vizData.traitLabels,
        pageParams: params
      })
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
          <GMMatrixChart
            data={this.state.data}
            markerLabels={this.state.markerLabels}
            traitLabels={this.state.traitLabels}
            pageParams={this.state.pageParams}
            threshold={this.state.correlationThreshold}
            zoom={this.state.zoomEnabled}
          />
        </div>
        <GMMatrixToolbar
          left={this.props.minPad}
          right={this.props.minPad}
          slider={{"onThresholdChange": this.onThresholdChange}}
          pageParams={this.state.pageParams}
          traitLabels={this.state.traitLabels}
        />
      </div>
    )
  }
})

export default GMMatrixVisualization
