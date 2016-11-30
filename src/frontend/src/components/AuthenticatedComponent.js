import React from 'react'
import { connect } from 'react-redux'
import { redirectToLogin } from '../actions'

const welcomeSrc = 'images/welcome.svg';

export function requireAuthentication (Component) {
  class AuthenticatedComponent extends React.Component {

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
          <div id="welcomeScreen" style={{"position": "fixed", "visibility": "hidden", "top": "0%", 
          "left": "0%", "height": "100%", "width": "100%", "textAlign": "center", 
          "zIndex":"99999999999999999999999", "backgroundColor": "white"}}>
            <img src={welcomeSrc}/>
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
