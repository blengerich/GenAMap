import React from 'react'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Avatar from 'material-ui/Avatar'
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close'

import GMRunAnalysisDialogContainer from './GMRunAnalysisDialogContainer'
import GMSettingContainer from './GMSettingContainer'
import GMActivities from './GMActivities'
import GMActivitiesContainer from './GMActivitiesContainer'
import config from '../../config'
import fetch from './fetch'

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
    return {dialogOpen: false, activityOpen: false, settingOpen:false, anchorElAct: null, anchorElSet: null,
            logoIndex: 0, logos: ['logo-01.png', 'logo-02.png']}
  },
  handleRunAnalysisButton: function () {
    this.setState({dialogOpen: true})
  },
  handleActivityButton: function (event) {
    this.setState({activityOpen: true, anchorElAct: event.currentTarget})
  },
  changeLogo: function () {
    this.setState({logoIndex: (this.state.logoIndex + 1) % this.state.logos.length})
  },
  handleSettingsButton: function (event) {
    this.setState({settingOpen: true})
  },
  handleAboutButton: function(event) {
    window.open('http://www.sailing.cs.cmu.edu/main/genamap/', '_blank')
  },
  handleHelpButton: function(event) {
    window.open('../instructions.pdf', '_blank')
  },
  handleLogoutButton: function (event) {
    this.props.handleLogoutButton()
  },
  onActivityClose: function () {
    this.setState({activityOpen: false})
  },
  onSettingClose: function () {
    this.setState({settingOpen: false})
  },
  onDialogClose: function () {
    this.setState({dialogOpen: false})
  },
  render: function () {
    var logosrc = 'images/' + this.state.logos[this.state.logoIndex]
    const menuIcon =
      <IconButton
        iconClassName="material-icons"
        onTouchTap={this.props.handleLeftIconTouch}
      >
        menu
      </IconButton>

    return (
      <div>
        <AppBar
          title=''
          style={Object.assign(this.props.style, styles.appBar)}
          iconElementLeft={menuIcon}
        >
          <Avatar src={logosrc} style={{alignSelf: 'center', border: 'none', order: 0}} />
          <h1 style={Object.assign({visibility: this.props.visibility}, styles.header)}>genamap</h1>
          <FlatButton style={styles.appBarLink} label='Run Analysis' onClick={this.handleRunAnalysisButton} />
          <FlatButton style={styles.appBarLink} label='Activity' onClick={this.handleActivityButton} />
          <FlatButton style={styles.appBarLink} label='Account' onClick={this.handleSettingsButton} />
          <FlatButton style={styles.appBarLink} label='About' onClick={this.handleAboutButton} />
          <FlatButton style={styles.appBarLink} label='Tutorial' onClick={this.handleHelpButton} />
          <FlatButton style={styles.appBarLink} label='Logout' onClick={this.handleLogoutButton} />
        </AppBar>
        <GMRunAnalysisDialogContainer
          open={this.state.dialogOpen}
          onClose={this.onDialogClose}
          submit={this.runAnalysis}
        />
        <GMSettingContainer
          open={this.state.settingOpen}
          onSettingClose={this.onSettingClose}
        />
        <GMActivitiesContainer
          open={this.state.activityOpen}
          anchorElAct={this.state.anchorElAct}
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
