import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'

var GMUser = React.createClass({
  render: function () {
    return (
      <AppBar
        title={this.props.user}
        showMenuIconButton={false}
      />
    )
  }
})

export default GMUser
