import React from 'react'
import AppBar from 'material-ui/lib/app-bar'
import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import IconButton from 'material-ui/lib/icon-button'
import FontIcon from 'material-ui/lib/font-icon'

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
