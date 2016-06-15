import React, { PropTypes, Component } from 'react'

import GMTopMenu from './GMTopMenu'
import GMLeftMenu from './GMLeftMenu'
import GMRightMenu from './GMRightMenu'
import config from '../../config'

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

  handleRightIconTouch () {
    this.props.rightIconTouch()
  }

  handleLogoutButton () {
    this.props.logout()
  }

  render () {
    console.log("GMApp props");
    console.log(this.props);
    const padding = {
      paddingLeft: this.getPadding(this.props.leftNavOpen),
      paddingRight: this.getPadding(this.props.rightNavOpen)
    }
    return (
      <div>
        <GMTopMenu
          handleLeftIconTouch={this.handleLeftIconTouch.bind(this)}
          handleRightIconTouch={this.handleRightIconTouch.bind(this)}
          handleLogoutButton={this.handleLogoutButton.bind(this)}
          style={padding}
          visibility={this.getVisibility()}
        />
        <GMLeftMenu open={this.props.leftNavOpen} width={config.ui.navWidth} user={this.props.user} />
        <GMRightMenu open={this.props.rightNavOpen} width={config.ui.navWidth} />
        <main style={padding}>
          {this.props.children}
        </main>
      </div>
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
