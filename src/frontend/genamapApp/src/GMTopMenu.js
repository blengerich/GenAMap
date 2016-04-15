var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var FlatButton = require('material-ui/lib/flat-button');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');

var GMRunAnalysisDialog = require('./GMRunAnalysisDialog');
var GMActivity = require('./GMActivity');
var PostRequest = require('./Requests').PostRequest;

var styles = {
  appBarLink: {
    color: "#fff"
  },
  appBarIcon: {
    marginTop: "8px",
  },
};

var GMTopMenu = React.createClass({
  getInitialState: function () {
    return {dialogOpen: false, activityOpen: false, anchorEl: null};
  },
  handleRunAnalysisButton: function () {
    this.setState({dialogOpen: true});
  },
  handleActivityButton: function (event) {
    this.setState({activityOpen: true, anchorEl: event.currentTarget});
  },
  onActivityClose: function () {
    this.setState({activityOpen: false});
  },
  onDialogClose: function () {
    this.setState({dialogOpen: false});
  },
  runAnalysis: function (runAnalysisRequest) {
    PostRequest(this.props.runAnalysisUrl, runAnalysisRequest, (processedData) => {
      console.log(processedData);
    });
  },
  render: function () {
    return (
    <div>
      <AppBar title="Genamap" style={this.props.style}
              onLeftIconButtonTouchTap={this.props.handleLeftIconTouch}>
          <FlatButton style={styles.appBarLink} label="Run Analysis" onClick={this.handleRunAnalysisButton} />
          <FlatButton style={styles.appBarLink} label="History" />
          <FlatButton style={styles.appBarLink} label="Activity" onClick={this.handleActivityButton} />
          <FlatButton style={styles.appBarLink} label="Help" />
          <FlatButton style={styles.appBarLink} label="Settings" />
          <IconButton style={styles.appBarIcon} touch={true} onClick={this.props.handleRightIconTouch}>
            <FontIcon color={styles.appBarLink.color} className="material-icons">menu</FontIcon>
          </IconButton>
      </AppBar>
      <GMRunAnalysisDialog open={this.state.dialogOpen}
                           projectUrl={this.props.projectUrl} 
                           algorithmUrl={this.props.algorithmUrl}
                           onClose={this.onDialogClose}
                           submit={this.runAnalysis} />
      <GMActivity open={this.state.activityOpen}
                  anchorEl={this.state.anchorEl}
                  onActivityClose={this.onActivityClose}
                  anchorOrigin={this.state.anchorOrigin}
                  targetOrigin={this.state.targetOrigin}
                  onRequestClose={this.handleRequestClose} />
    </div>
    );
  }
});

module.exports = GMTopMenu