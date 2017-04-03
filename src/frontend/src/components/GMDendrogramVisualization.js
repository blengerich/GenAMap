import React from 'react'
import GMDendrogramChart from './GMDendrogramChart'
import GMDendrogramToolbar from './GMDendrogramToolbar'

import fetch from './fetch'
import config from '../../config'

const GMDendrogramVisualization = React.createClass({
  componentDidMount() {
    this.loadData(this.props.params)
    /*this.setState({ pageParams: [] })*/
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
    console.log(params);
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
      return fetch(`${config.api.dataUrl}/${params.tree1}`, dataRequest)
    }).then(response => {
        if (!response.ok) Promise.reject(response.json())
        return response.json()
    }).then(json => {
      vizData.tree1 = JSON.parse(json.data)
      return fetch(`${config.api.dataUrl}/${params.tree1}`, dataRequest)
    }).then(response => {
        if (!response.ok) Promise.reject(response.json())
        return response.json()
    }).then(json => {
      vizData.tree2 = JSON.parse(json.data)
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
        tree1: vizData.tree1,
        tree2: vizData.tree2,
        pageParams: params
      })
      return json
    }).catch(err => console.log(err))
  },
  render() {
    return (
      <div>
        <div className="dendrogram">
          <GMDendrogramChart
            data={this.state.data}
            markerLabels={this.state.markerLabels}
            traitLabels={this.state.traitLabels}
            tree1={this.state.tree1}
            tree2={this.state.tree2}
            pageParams={this.state.pageParams}
          />
        </div>
        <GMDendrogramToolbar
          left={this.props.minPad}
          right={this.props.minPad}
          pageParams={this.state.pageParams}
        />
      </div>
    )
  }
})

export default GMDendrogramVisualization
