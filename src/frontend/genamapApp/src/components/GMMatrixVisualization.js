import React from 'react'

import GMMatrixToolbar from './GMMatrixToolbar'

const GMMatrixVisualization = React.createClass({
  render: function () {
    return (
      <div>
        <p>Put your HTML here</p>
        <GMMatrixToolbar
          left={this.props.left - this.props.minPad}
          right={this.props.right - this.props.minPad}
        />
      </div>
    )
  }
})

export default GMMatrixVisualization
