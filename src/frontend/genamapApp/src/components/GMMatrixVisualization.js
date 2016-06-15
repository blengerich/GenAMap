import React from 'react'
import D3Chart from './D3Chart'
import GMMatrixToolbar from './GMMatrixToolbar'

const GMMatrixVisualization = React.createClass({
  render: function () {
    console.log("Matrix vis: ", this.props);
    return (
      <div>
        <div className="Matrix">
          <D3Chart />
        </div>
        <GMMatrixToolbar
          left={this.props.minPad}
          right={this.props.minPad}
        />
      </div>
    )
  }
})

export default GMMatrixVisualization
