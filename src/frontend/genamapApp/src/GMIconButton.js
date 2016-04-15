var React = require('react');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');

var GMIconButton = React.createClass({
  render: function() {
    return (
      <IconButton touch={true}>
        <FontIcon className="material-icons">{this.props.icon}</FontIcon>
      </IconButton>
    );
  }
});

module.exports = GMIconButton