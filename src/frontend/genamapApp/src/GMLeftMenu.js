var React = require('react');
var LeftNav = require('material-ui/lib/left-nav');

var GMUser = require('./GMUser');
var GMProjectMenu = require('./GMProjectMenu');

var GMLeftMenu = React.createClass({
  render: function () {
    return (
      <LeftNav open={this.props.open} width={this.props.width}>
        <GMUser />
        <GMProjectMenu projectUrl={this.props.projectUrl} 
                       speciesUrl={this.props.speciesUrl} 
                       importDataUrl={this.props.importDataUrl}/>
      </LeftNav>
    );
  }
})

module.exports = GMLeftMenu