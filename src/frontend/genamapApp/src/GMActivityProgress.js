var React = require('react');
var List = require('material-ui/lib/lists/list');
var ListItem = require('material-ui/lib/lists/list-item');
var LinearProgress = require('material-ui/lib/linear-progress');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');

var GetRequest = require('./Requests').GetRequest;

var styles = {
  flexWrapper: {
    display: 'flex',
  },
  flexItem: {
    flex: '1 1 auto',
  },
  flexItemPrimary: {
    flex: '1 1 50%',
  },
  primaryuText: {
  },
  secondaryText: {
    fontSize: '14px',
    lineHeight: '16px',
    height: '16px',
    margin: 0,
    marginTop: '4px',
    color: 'rgba(0, 0, 0, 0.54)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    muiPrepared: '',
  },
  progress: {
    flex: '1 1 auto',
    width: '50%',
  },
};

var GMActivityProgress = React.createClass({
  getInitialState: function () {
    return {completed: 0};
  },
  componentDidMount: function () {
    this.timer = setTimeout(() => this.progress(5), 1000);
  },
  componentWillUnmount: function () {
    clearTimeout(this.timer);
  },
  progress: function (completed) {
    if (completed > 100) {
      this.setState({completed: 100});
      clearTimeout(this.timer);
    } else {
      this.setState({completed});
      this.getActivity(function (activity) {
        const diff = Math.random() * 10;
        this.timer = setTimeout(() => this.progress(completed + diff), 1000);  
      });
    }
  },
  getActivity: function () {
    GetRequest('/api/activity/' + this.props.id, {}, (activity) => {
      
    });
  }
  render: function () {
    return (
      <List>
        <ListItem
          disabled={true}
          rightIconButton={
            <IconButton 
              tooltip="Cancel"
              tooltipPosition="bottom-center">
              <FontIcon className="material-icons">cancel</FontIcon>
            </IconButton>
          }
        >
          <div style={styles.flexWrapper}>
            <div style={styles.flexItem}>
              <div style={styles.primaryText}>Algorithm 3</div>
              <div style={styles.secondaryText}>Additional info</div>
            </div>
            <div style={styles.flexItemPrimary}>
              <LinearProgress mode="determinate" value={this.state.completed} />
              <span style={styles.secondaryText}>{this.state.completed.toFixed(1) + "%"}</span>
            </div>
          </div>
        </ListItem>
      </List>
    );
  }
});

module.exports = GMActivityProgress