import React from 'react'
import GMManhattanChart from './GMManhattanChart'
import GMManhattanToolbar from './GMManhattanToolbar'

import fetch from './fetch'
import config from '../../config'

const GMManhattanVisualization = React.createClass({
  componentDidMount() {
    this.loadData(this.props.params),
    this.setState({ pageParams: [] })
  },
  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps.params)
  },
  getInitialState() {
    return {
      pageParams: []
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
    return fetch(`${config.api.dataUrl}/${params.results}`, dataRequest)
    .then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.data = JSON.parse(json.data)
      return fetch(`${config.api.dataUrl}/${params.markers}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.markerLabels = json.data.split('\n').filter(function(line){
          return line.length > 0
      })
      return fetch(`${config.api.dataUrl}/${params.traits}`, dataRequest)
    }).then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      vizData.traitLabels = json.data.split('\n').filter(function(line){
          return line.length > 0
      })
      this.setState({
        data: vizData.data,
        markerLabels: vizData.markerLabels,
        traitLabels: vizData.traitLabels,
        pageParams: params
      })
      return json
    }).catch(err => console.log(err))
  },
  render() {
    return (
      <div>
        <div className="Manhattan">
          <GMManhattanChart
            data={this.state.data}
            markerLabels={this.state.markerLabels}
            traitLabelsNum={this.state.pageParams.traitNum}
            pageParams={this.state.pageParams}
          />
        </div>
        <GMManhattanToolbar
          left={this.props.minPad}
          right={this.props.minPad}
          pageParams={this.state.pageParams}
        />
      </div>
    )
  }
})

export default GMManhattanVisualization
