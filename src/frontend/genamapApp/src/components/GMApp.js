import React, { PropTypes, Component } from 'react'

import GMTopMenu from './GMTopMenu'
import GMLeftMenu from './GMLeftMenu'
import GMRightMenu from './GMRightMenu'
import DevTools from './DevTools'
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

  componentDidMount () {
    // this.props.lock.getProfile(this.props.idToken, function (err, profile) {
    //   if (err) {
    //     console.log('Error loading the profile: ', err)
    //     return
    //   }
    //   this.setState({ profile })
    // }.bind(this))
  }

  handleLeftIconTouch () {
    this.props.leftIconTouch()
  }

  handleRightIconTouch () {
    this.props.rightIconTouch()
  }

  render () {
    const padding = {
      paddingLeft: this.getPadding(this.props.leftNavOpen),
      paddingRight: this.getPadding(this.props.rightNavOpen)
    }
    return (
      <div>
        <DevTools />
        <GMTopMenu
          handleLeftIconTouch={this.handleLeftIconTouch.bind(this)}
          handleRightIconTouch={this.handleRightIconTouch.bind(this)}
          style={padding}
          visibility={this.getVisibility()}
        />
        <GMLeftMenu open={this.props.leftNavOpen} width={config.ui.navWidth} />
        <GMRightMenu open={this.props.rightNavOpen} width={config.ui.navWidth} />
        <main className='gm-layout__content' style={padding}>
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
  lock: PropTypes.object
}

export default GMApp
