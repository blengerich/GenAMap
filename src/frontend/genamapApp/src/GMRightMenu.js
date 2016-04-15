var React = require('react');
var LeftNav = require('material-ui/lib/left-nav');
var Tabs = require('material-ui/lib/tabs/tabs');
var Tab = require('material-ui/lib/tabs/tab');

var styles = {
  tabs: {
    backgroundColor: 'transparent',
  },
  tab: {
    color: '#00bcd4',
  }
};

var GMRightMenu = React.createClass({
  render: function () {
    return (
      <LeftNav open={this.props.open} openRight={true} width={this.props.width}>
        <Tabs tabItemContainerStyle={styles.tabs}>
          <Tab label="Starred" style={styles.tab} />
          <Tab label="Subsets" style={styles.tab} />
        </Tabs>
      </LeftNav>
    );
  }
})

module.exports = GMRightMenu