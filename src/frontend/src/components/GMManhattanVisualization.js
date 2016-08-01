import React from 'react'
import GMManhattanChart from './GMManhattanChart'

import fetch from './fetch'
import config from '../../config'

const GMManhattanVisualization = React.createClass({
  getInitialState() {
    return {
      pageParams: []
    }
  },
  componentDidMount() {
    this.setState({ pageParams: [] })
  },
  render() {
    return (
      <div>
        <div className="Manhattan">
          <GMManhattanChart
            pageParams={this.state.pageParams}
          />
        </div>
      </div>
    )
  }
})

export default GMManhattanVisualization
