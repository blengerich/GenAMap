import React, { PropTypes, Component } from 'react'

import GMTopMenu from './GMTopMenu'
import GMLeftMenu from './GMLeftMenu'
import config from '../../config'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class GMApp extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = { profile: null }
  }

  getPadding (open) {
    const padding = (open) ? config.ui.minPad + config.ui.navWidth : config.ui.minPad
    return padding + 'px'
  }

  getVisibility () {
    return (this.props.leftNavOpen && this.props.rightNavOpen) ? 'hidden' : 'visible'
  }

  handleLeftIconTouch () {
    this.props.leftIconTouch()
  }

  handleLogoutButton () {
    this.props.logout()
  }

  render () {
    const navPadding = {
      paddingLeft: this.getPadding(this.props.leftNavOpen),
      paddingRight: this.getPadding(this.props.rightNavOpen)
    }
    const fixedPadding = {
      paddingLeft: config.ui.minPad,
      paddingRight: config.ui.minPad
    }
    var childrenWithProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, { minPad: config.ui.minPad });
    });
    return (
      <MuiThemeProvider>
        <div>
          <GMTopMenu
            handleLeftIconTouch={this.handleLeftIconTouch.bind(this)}
            handleLogoutButton={this.handleLogoutButton.bind(this)}
            style={navPadding}
            visibility={this.getVisibility()}
          />
          <GMLeftMenu open={this.props.leftNavOpen} width={config.ui.navWidth} user={this.props.user} />
          <main style={fixedPadding}>
            {childrenWithProps}
          </main>
        </div>
      </MuiThemeProvider>
    )
  }
}

GMApp.propTypes = {
  leftNavOpen: PropTypes.bool.isRequired,
  rightNavOpen: PropTypes.bool.isRequired,
  leftIconTouch: PropTypes.func.isRequired,
  rightIconTouch: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
}

export default GMApp
