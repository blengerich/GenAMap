import React from 'react'
import { connect } from 'react-redux'
import { redirectToLogin } from '../actions'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import FloatingActionButton from 'material-ui/lib/floating-action-button'

export function requireAuthentication (Component) {
  class AuthenticatedComponent extends React.Component {
    constructor() {
      super();
      this.state = {imgIndex: 1}
    }

    changeSrc() {
        if (this.state.imgIndex < 9) {
          this.setState({imgIndex: this.state.imgIndex + 1});
        } else {
          document.getElementById("welcomeScreen").remove();
        }
    }

    cancelWelcome() {
      document.getElementById("welcomeScreen").remove();
    }

    componentWillMount () {
      this.checkAuth()
    }

    componentWillReceiveProps (nextProps) {
      this.checkAuth()
    }

    checkAuth () {
      if (!this.props.isAuthenticated) {
        const redirectAfterLogin = this.props.location.pathname
        this.props.redirectToLogin(redirectAfterLogin)
      } else {
        if (document.cookie.indexOf("visited") >= 0) {
          // already visited before, do not show welcome screen
          setTimeout(function() {
            document.getElementById("welcomeScreen").remove()
          }, 100)
        } else {
          // first time visiting, show welcome screen
          document.cookie = "visited";
          setTimeout(function() {
            document.getElementById("welcomeScreen").style.visibility = "visible"
          }, 100)
        }
      }
    }

    render () {

      return (
        <div>
          <div id="welcomeScreen" style={{"position": "fixed", "top": "0%", "visibility": "none",
          "left": "0%", "height": "100%", "width": "100%", "textAlign": "center", "zIndex":"999999"}}>
            <img src={"tutorial/" + String(this.state.imgIndex) + ".png"} style={{"width": "100%",
            "minWidth": "1200px", "minHeight": "800px"}} />
            <div style={{"position": "absolute", "left": "0", "top": "0", "textAlign": "center",
            "width": "100%", "height": "100%", "paddingTop": "500px"}}>
            <button onClick={this.changeSrc.bind(this)}
            style={{"width": "300px", "fontSize": "1.6em",
                    "fontFamily": "Roboto", "backgroundColor": "#fdb515",
                    "color": "white", "border": "none", "padding": "5px", "boxShadow": "5px 5px 2px rgba(0,0,0,0.3)"}}>
                    Continue Tutorial</button>
            </div>
          </div>
          <div>
            {this.props.isAuthenticated && <Component {...this.props} />}
          </div>
        </div>
      )
    }
  }

  const mapStateToProps = (state) => ({
    token: state.userData.auth.token,
    isAuthenticated: state.userData.auth.isAuthenticated
  })

  const mapDispatchToProps = (dispatch) => ({
    redirectToLogin: (next) => {
      dispatch(redirectToLogin(next))
    }
  })

  return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent)
}
