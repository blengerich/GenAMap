import React from 'react'
import { connect } from 'react-redux'
import { redirectToLogin } from '../actions'

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
      }
    }

    render () {
      return (
        <div>
          {this.props.isAuthenticated && <Component {...this.props} />}
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
