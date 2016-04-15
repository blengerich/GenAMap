var React = require('react');
var FontIcon = require('material-ui/lib/font-icon');
var FlatButton = require('material-ui/lib/flat-button');
var Slider = require('material-ui/lib/slider');
var AutoComplete = require('material-ui/lib/auto-complete');

var GMToolbar = require('./GMToolbar');

var styles = {
  slider: {
    flex: '3 1 auto',
  },
  action: {
    flex: '0 1 auto',
  },
}

var GMProjectSearch = React.createClass({
  getInitialState: function () {
    return {dataSource: ["a"]};
  },
  componentWillReceiveProps: function (nextProps) {
    var newState = {}
    if (nextProps.data !== null) newState.data = nextProps.data;
    this.setState(newState);
  },
  render: function () {
    return (
        <AutoComplete
          hintText="Search for files"
          dataSource={this.state.dataSource} 
          filter={AutoComplete.caseInsensitiveFilter}
          style={{width: "inherit"}}
        />
    );
  }
});

var GMMatrixToolbar = React.createClass({
  getInitialState: function () {
    return {open: true};
  },
  handleToggle: function () {
    this.setState({open: !this.state.open});
  },
  render: function () {
    return (
      <div>
        <FlatButton label="Toggle Toolbar" onTouchTap={this.handleToggle} />
        <GMToolbar 
          open={this.state.open} 
          height={100}
          left={this.props.left}
          right={this.props.right}
        >
          <Slider style={styles.slider} />
          <FlatButton
            label="Create a subset"
            icon={<FontIcon className="material-icons">add</FontIcon>}
            style={styles.action}
          />
          <FlatButton
            label="Sort"
            icon={<FontIcon className="material-icons">sort</FontIcon>}
            style={styles.action}
          />
          <GMProjectSearch />
        </GMToolbar>
      </div>
    );
  }
})

module.exports = GMMatrixToolbar