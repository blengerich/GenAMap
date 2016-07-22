import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme'
import Transitions from 'material-ui/lib/styles/transitions'
import Toolbar from 'material-ui/lib/toolbar/toolbar'

var GMToolbar = React.createClass({

  propTypes: {
    /**
     * Can be a `ToolbarGroup` to render a group of related items.
     */
    children: PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: PropTypes.string,

    height: PropTypes.number,

    /**
     * Do not apply `desktopGutter` to the `Toolbar`.
     */
    noGutter: PropTypes.bool,

    open: PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: PropTypes.object
  },

  contextTypes: {
    muiTheme: PropTypes.object
  },

  childContextTypes: {
    muiTheme: PropTypes.object
  },

  getDefaultProps () {
    return {
      height: null,
      noGutter: false,
      open: true
    }
  },

  getInitialState () {
    return {
      open: this.props.open,
      muiTheme: this.context.muiTheme || getMuiTheme()
    }
  },

  getChildContext () {
    return {
      muiTheme: this.state.muiTheme
    }
  },

  componentWillReceiveProps (nextProps, nextContext) {
    const newState = {muiTheme: nextContext.muiTheme || this.state.muiTheme}

    // If controlled then the open prop takes precedence.
    if (nextProps.open !== null) newState.open = nextProps.open

    this.setState(newState)
  },

  getStyles () {
    const { toolbar } = this.state.muiTheme

    const y = this.state.open ? 0 : this._getMaxTranslateY()

    return {
      root: {
        height: this.props.height || toolbar.height,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transform: `translate3d(0, ${y}px, 0)`,
        transition: Transitions.easeOut(null, 'transform', null),
        overflow: 'auto',
        position: 'fixed',
        bottom: 0,
        left: this.props.left,
        right: this.props.right,
        width: 'inherit'
      }
    }
  },

  _shouldShow () {
    return this.state.open
  },

  _close (reason) {
    if (this.props.open === null) this.setState({open: false})
    if (this.props.onRequestChange) this.props.onRequestChange(false, reason)
    return this
  },

  _open (reason) {
    if (this.props.open === null) this.setState({open: true})
    if (this.props.onRequestChange) this.props.onRequestChange(true, reason)
    return this
  },

  _getMaxTranslateY () {
    const height = this.props.height || this.state.muiTheme.toolbar.height
    return height + 10
  },

  _setPosition (translateY) {
    const gmToolbar = ReactDOM.findDOMNode(this.refs.toolbar)
    const transformCSS = `translate3d(0, ${translateY}px, 0)`
    autoPrefix.set(gmToolbar.style, 'transform', transformCSS, this.state.muiTheme)
  },

  render () {
    const {
      children,
      className,
      style,
      ...other
    } = this.props

    var styles = this.getStyles()

    return (
      <Toolbar
        {...other}
        className={className}
        style={Object.assign({}, styles.root, style)}
      >
        {children}
      </Toolbar>
    )
  }
})

export default GMToolbar
