import React from 'react'
import GMManhattanChart from './GMManhattanChart'
import GMManhattanToolbar from './GMManhattanToolbar'

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
        <GMManhattanToolbar
          left={this.props.minPad}
          right={this.props.minPad}
        />
      </div>
    )
  }
})

export default GMManhattanVisualization
