import React, { Component, PropTypes } from 'react'

import LoggedInContainer from './LoggedInContainer'
import Login from './Login'
import { loginUser, logoutUser } from '../actions'

class GMApp extends Component {

  render () {
    const { dispatch, isAuthenticated, errorMessage } = this.props

    if (isAuthenticated) {
      return <LoggedInContainer onLogoutClick={() => dispatch(logoutUser())} />
    } else {
      return (
        <Login
          errorMessage={errorMessage}
          onLoginClick={creds => dispatch(loginUser(creds))}
        />
      )
    }
  }
}

GMApp.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
}

export default GMApp
