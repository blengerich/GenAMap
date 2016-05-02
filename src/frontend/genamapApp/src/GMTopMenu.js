var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var FlatButton = require('material-ui/lib/flat-button');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');
var Avatar = require('material-ui/lib/avatar');

var GMRunAnalysisDialog = require('./GMRunAnalysisDialog');
var GMActivity = require('./GMActivity');
var PostRequest = require('./Requests').PostRequest;

var styles = {
  appBarLink: {
    color: "#fff",
  },
  appBarIcon: {
    marginTop: "8px",
  },
};

var GMTopMenu = React.createClass({
  getInitialState: function () {
    return {dialogOpen: false, activityOpen: false, anchorEl: null, 
            logoIndex: 0, logos: ["logo-01.png", "logo-02.png"]};
  },
  handleRunAnalysisButton: function () {
    this.setState({dialogOpen: true});
  },
  handleActivityButton: function (event) {
    this.setState({activityOpen: true, anchorEl: event.currentTarget});
  },
  changeLogo: function () {
    this.setState({logoIndex: (this.state.logoIndex + 1) % this.state.logos.length});
  },
  handleSettingsButton: function (event) {
    console.log("settings");
    this.changeLogo();
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
    var logosrc = "images/" + this.state.logos[this.state.logoIndex];
    return (
    <div>
      <AppBar title="" style={this.props.style}
              onLeftIconButtonTouchTap={this.props.handleLeftIconTouch}>
          <Avatar src={logosrc} style={{alignSelf: "center", border: "none", order: 0}} />
          <h1 style={{whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      margin: 0,
                      marginLeft: "10px",
                      paddingTop: 0,
                      letterSpacing: 0,
                      fontFamily: "comfortaaregular",
                      fontSize: "22px",
                      fontWeight: 400,
                      color: "#ffffff",
                      lineHeight: "64px",
                      flex: 1,
                      visibility: this.props.titleDisplay,
                      transition: "visibility 0s linear 0.05s",
                    }}>genamap</h1>
          <FlatButton style={styles.appBarLink} label="Run Analysis" onClick={this.handleRunAnalysisButton} />
          <FlatButton style={styles.appBarLink} label="History" />
          <FlatButton style={styles.appBarLink} label="Activity" onClick={this.handleActivityButton} />
          <FlatButton style={styles.appBarLink} label="Help" />
          <FlatButton style={styles.appBarLink} label="Settings" onClick={this.handleSettingsButton} />
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