var React = require('react');
var getMuiTheme = require('material-ui/lib/styles/getMuiTheme');
var Transitions = require('material-ui/lib/styles/transitions');
var Toolbar = require('material-ui/lib/toolbar/toolbar');

var GMToolbar = React.createClass({

  propTypes: {
    /**
     * Can be a `ToolbarGroup` to render a group of related items.
     */
    children: React.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: React.PropTypes.string,

    height: React.PropTypes.number,

    /**
     * Do not apply `desktopGutter` to the `Toolbar`.
     */
    noGutter: React.PropTypes.bool,

    open: React.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: React.PropTypes.object,
  },

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      height: null,
      noGutter: false,
      open: true,
    };
  },

  getInitialState() {
    return {
      open: this.props.open,
      muiTheme: this.context.muiTheme || getMuiTheme(),
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  componentWillReceiveProps(nextProps, nextContext) {
    var newState = {muiTheme: nextContext.muiTheme || this.state.muiTheme};

    // If controlled then the open prop takes precedence.
    if (nextProps.open !== null) newState.open = nextProps.open;
    
    this.setState(newState);
  },

  getStyles() {
    var {
      baseTheme,
      toolbar,
    } = this.state.muiTheme;

    var y = this.state.open ? 0 : this._getMaxTranslateY();

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
        width: 'inherit',
      },
    };
  },

  _shouldShow() {
    return this.state.open;
  },

  _close(reason) {
    if (this.props.open === null) this.setState({open: false});
    if (this.props.onRequestChange) this.props.onRequestChange(false, reason);
    return this;
  },

  _open(reason) {
    if (this.props.open === null) this.setState({open: true});
    if (this.props.onRequestChange) this.props.onRequestChange(true, reason);
    return this;
  },

  _getMaxTranslateY() {
    var height = this.props.height || this.state.muiTheme.toolbar.height;
    return height + 10;
  },

  _setPosition(translateY) {
    var toolbar = ReactDOM.findDOMNode(this.refs.toolbar);
    var transformCSS = `translate3d(0, ${translateY}px, 0)`;
    autoPrefix.set(gmToolbar.style, 'transform', transformCSS, this.state.muiTheme);
  },

  render () {
    var {
      children,
      className,
      style,
      ...other,
    } = this.props;

    var {
      prepareStyles,
    } = this.state.muiTheme;

    var styles = this.getStyles();

    return (
      <Toolbar 
        {...other} 
        className={className} 
        style={Object.assign({}, styles.root, style)}
      >
        {children}
      </Toolbar>
    );
  },
});

module.exports = GMToolbar;