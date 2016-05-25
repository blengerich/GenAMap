import React from 'react'
import LeftNav from 'material-ui/lib/left-nav'

import GMUser from './GMUser'
import GMProjectMenuContainer from './GMProjectMenuContainer'

const GMLeftMenu = React.createClass({
  render: function () {
    return (
      <LeftNav open={this.props.open} width={this.props.width}>
        <GMUser />
        <GMProjectMenuContainer />
      </LeftNav>
    )
  }
})

export default GMLeftMenu
