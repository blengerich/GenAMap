var React = require('react');
var FontIcon = require('material-ui/lib/font-icon');

var GMIcon = React.createClass({
  render: function() {
    return (
      <FontIcon className="material-icons">{this.props.icon}</FontIcon>
    );
  }
});

module.exports = GMIcon