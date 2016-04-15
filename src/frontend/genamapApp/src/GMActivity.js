var React = require('react');
var Popover = require('material-ui/lib/popover/popover');
var Tabs = require('material-ui/lib/tabs/tabs');
var Tab = require('material-ui/lib/tabs/tab');

var GMActivityProgress = require('./GMActivityProgress');
var GetRequest = require('./Requests').GetRequest;

var styles = {
  popover: {
    minWidth: '320px',
  },
  tabs: {
    backgroundColor: 'transparent',
  },
  tab: {
    color: '#00bcd4',
  }
};

var GMActivity = React.createClass({
  getInitialState: function () {
    return {open: this.props.open, tabValue: 'running'};
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open,
      anchorEl: nextProps.anchorEl,
    });
    if (nextProps.open) {
      var updateInterval = setInterval(this.updateActivity, 300);
      this.setState({updateInterval: updateInterval});
    }
  },
  handleRequestClose: function () {
    clearInterval(this.state.updateInterval);
    this.props.onActivityClose();
  },
  handleRunning: function () {
    this.getActivity('running', (activity) => {
      this.setState({running: activity});
    });
  },
  handleAll: function () {
    this.getActivity('all', (activity) => {
      this.setState({all: activity});
    });
  },
  handleCompleted: function () {
    this.getActivity( (activity) => {
      this.setState({completed: activity});
    });
  },
  getActivity: function (type, callback) {
    GetRequest('/api/activity/' + type, {}, (activity) => {
      callback(activity);
    });
  },
  updateActivity: function () {
    switch (this.state.tabValue) {
      case 'running': 
        this.handleRunning();
        break;
      case 'completed':
        this.handleCompleted();
        break;
      case 'all': 
        this.handleAll();
        break;
      default:
        window.alert("How'd we get here?");
    }
  },
  handleTabChange: function (tabValue) {
    this.setState({tabValue: tabValue});
    console.log(tabValue);
  },
  render: function () {
    return (
      <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'middle', vertical: 'top'}}
        onRequestClose={this.handleRequestClose}
        style={styles.popover}
      >
        <Tabs tabItemContainerStyle={styles.tabs}
              value={this.state.tabValue}
              onChange={this.handleTabChange}>
          <Tab label="Running"
               value="running" 
               style={styles.tab}
               onActive={this.handleRunning}
          >
            <GMActivityProgress />
          </Tab>
          <Tab label="All"
               value="all"
               style={styles.tab} 
               onActive={this.handleAll}
          />
          <Tab label="Completed"
               value="completed"
               style={styles.tab} 
               onActive={this.handleCompleted}
          />
        </Tabs>
      </Popover>
    );
  }
});

module.exports = GMActivity