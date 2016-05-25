import React from 'react'
import AppBar from 'material-ui/lib/app-bar'
import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import IconButton from 'material-ui/lib/icon-button'
import FontIcon from 'material-ui/lib/font-icon'

var iconButtonElement = (
  <IconButton touch={true}>
    <FontIcon className='material-icons'>arrow_drop_down</FontIcon>
  </IconButton>
)

var GMUser = React.createClass({
  render: function () {
    return (
      <AppBar
        title={!this.props.user ? 'a@a.com' : this.props.user.email}
        showMenuIconButton={false}
        iconElementRight={
          <IconMenu iconButtonElement={iconButtonElement}>
            <MenuItem primaryText='Accounts' />
            <MenuItem primaryText='Other' />
          </IconMenu>
        }
      />
    )
  }
})

export default GMUser

