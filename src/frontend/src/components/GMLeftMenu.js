import React from 'react'
import LeftNav from 'material-ui/LeftNav'

import GMUser from './GMUser'
import GMProjectMenuContainer from './GMProjectMenuContainer'

const GMLeftMenu = React.createClass({
  render: function () {
    return (
      <LeftNav open={this.props.open} width={this.props.width}>
        <GMUser user={this.props.user} />
        <GMProjectMenuContainer />
      </LeftNav>
    )
  }
})

export default GMLeftMenu
