import React, { Component, PropTypes } from 'react'

class Login extends Component {

  render () {
    const { errorMessage } = this.props

    return (
      <div>
        <input
          type={'text'}
          ref={'username'}
          className={'form-control'}
          placeholder={'Username'}
        />
        <input
          type={'password'}
          ref={'password'}
          className={'form-control'}
          placeholder={'Password'}
        />
        <button onClick={(event) => this.handleCreateAccountClick(event)}>
          Create Account
        </button>
        <button onClick={(event) => this.handleLoginClick(event)}>
          Login
        </button>

        {errorMessage && <p>{errorMessage}</p>}
      </div>
    )
  }

  handleLoginClick (event) {
    const username = this.refs.username
    const password = this.refs.password
    const creds = { username: username.value.trim(), password: password.value.trim() }
    this.props.onLoginClick(creds, this.props.location.search)
  }

  handleCreateAccountClick (event) {
    const username = this.refs.username
    const password = this.refs.password
    const creds = { username: username.value.trim(), password: password.value.trim() }
    this.props.onCreateAccountClick(creds)
  }

}

Login.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
  onCreateAccountClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}

export default Login
