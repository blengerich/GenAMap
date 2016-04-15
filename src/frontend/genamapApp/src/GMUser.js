var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var IconMenu = require('material-ui/lib/menus/icon-menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var IconButton = require('material-ui/lib/icon-button');
var FontIcon = require('material-ui/lib/font-icon');

var iconButtonElement = (
  <IconButton touch={true}>
    <FontIcon className="material-icons">arrow_drop_down</FontIcon>
  </IconButton>
);

var GMUser = React.createClass({
  render: function () {
    return (
      <AppBar title="a@a.com" showMenuIconButton={false} iconElementRight={
          <IconMenu iconButtonElement={iconButtonElement}>
            <MenuItem primaryText="Accounts" />
            <MenuItem primaryText="Other" />
          </IconMenu>
        }
      />
    );
  }
});

module.exports = GMUser

