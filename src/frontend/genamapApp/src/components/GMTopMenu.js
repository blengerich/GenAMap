import React from 'react'
import AppBar from 'material-ui/lib/app-bar'
import FlatButton from 'material-ui/lib/flat-button'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'
import Avatar from 'material-ui/lib/avatar'

import GMRunAnalysisDialog from './GMRunAnalysisDialog'
import GMActivities from './GMActivities'
import { PostRequest } from './Requests'
import config from '../../config'

const styles = {
  appBar: {
    backgroundColor: config.ui.baseColor
  },
  appBarLink: {
    color: '#fff'
  },
  appBarIcon: {
    marginTop: '8px'
  },
  header: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
    marginLeft: '10px',
    paddingTop: 0,
    letterSpacing: 0,
    fontFamily: 'comfortaaregular',
    fontSize: '22px',
    fontWeight: 400,
    color: '#ffffff',
    lineHeight: '64px',
    flex: 1,
    transition: 'visibility 0s linear 0.05s'
  }
}

var GMTopMenu = React.createClass({
  getInitialState: function () {
    return {dialogOpen: false, activityOpen: false, anchorEl: null,
            logoIndex: 0, logos: ['logo-01.png', 'logo-02.png']}
  },
  handleRunAnalysisButton: function () {
    this.setState({dialogOpen: true})
  },
  handleActivityButton: function (event) {
    this.setState({activityOpen: true, anchorEl: event.currentTarget})
  },
  changeLogo: function () {
    this.setState({logoIndex: (this.state.logoIndex + 1) % this.state.logos.length})
  },
  handleSettingsButton: function (event) {
    this.changeLogo()
  },
  onActivityClose: function () {
    this.setState({activityOpen: false})
  },
  onDialogClose: function () {
    this.setState({dialogOpen: false})
  },
  runAnalysis: function (runAnalysisRequest) {
    PostRequest(this.props.runAnalysisUrl, runAnalysisRequest, (processedData) => {
      console.log(processedData)
    })
  },
  render: function () {
    var logosrc = 'images/' + this.state.logos[this.state.logoIndex]
    return (
      <div>
        <AppBar
          title=''
          style={Object.assign(this.props.style, styles.appBar)}
          onLeftIconButtonTouchTap={this.props.handleLeftIconTouch}
        >
          <Avatar src={logosrc} style={{alignSelf: 'center', border: 'none', order: 0}} />
          <h1 style={Object.assign({visibility: this.props.visibility}, styles.header)}>genamap</h1>
          <FlatButton style={styles.appBarLink} label='Run Analysis' onClick={this.handleRunAnalysisButton} />
          <FlatButton style={styles.appBarLink} label='Activity' onClick={this.handleActivityButton} />
          <FlatButton style={styles.appBarLink} label='Settings' onClick={this.handleSettingsButton} />
          <IconButton style={styles.appBarIcon} touch={true} onClick={this.props.handleRightIconTouch}>
            <FontIcon color={styles.appBarLink.color} className='material-icons'>menu</FontIcon>
          </IconButton>
        </AppBar>
        <GMRunAnalysisDialog
          open={this.state.dialogOpen}
          onClose={this.onDialogClose}
          submit={this.runAnalysis}
        />
        <GMActivities
          open={this.state.activityOpen}
          anchorEl={this.state.anchorEl}
          onActivityClose={this.onActivityClose}
          anchorOrigin={this.state.anchorOrigin}
          targetOrigin={this.state.targetOrigin}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    )
  }
})

export default GMTopMenu
