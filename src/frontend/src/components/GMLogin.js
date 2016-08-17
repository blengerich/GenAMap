import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Avatar from 'material-ui/lib/avatar'
import AppBar from 'material-ui/lib/app-bar'
import RaisedButton from 'material-ui/lib/raised-button'
import TextField from 'material-ui/lib/text-field'

import config from '../../config'

const logos = ['logo-01.png', 'logo-02.png']

const styles = {
  action: {
    margin: '10px 0',
    width: '70%'
  },
  appBar: {
    backgroundColor: config.ui.baseColor,
    marginBottom: '5%'
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto, sans-serif',
    position: 'absolute',
    left: '35%',
    top: '20%',
    width: '30%',
    height: '55%',
    textAlign: 'center'
  },
  form: {
    width: '70%'
  },
  header: {
    margin: '0 0 0 10px',
    paddingTop: 0,
    fontFamily: 'Roboto, sans-serif',
    fontSize: '2.2em',
    fontWeight: 400,
    color: '#ffffff',
    lineHeight: '64px'
  }
}

class Login extends Component {
  render () {
    const { errorMessage } = this.props
    const logosrc = 'images/' + logos[0]

    return (
      <div style={styles.background}>
        <div style={styles.body}>
          <AppBar
            title=''
            style={styles.appBar}
            showMenuIconButton={false}
          >
            <Avatar src={logosrc} style={{alignSelf: 'center', border: 'none', order: 0}} />
            <h1 style={styles.header}>GenAMap 2.0</h1>
          </AppBar>
          <p style={{ 'fontSize': '1.8em' }}>Sign In to GenAMap</p>
          <div>
            <TextField
              hintText={'Email Address'}
              type={'email'}
              onChange={this.onChangeUsername.bind(this)}
              style={styles.form}
            /><br/>
          </div>
          <div>
            <TextField
              errorText={errorMessage}
              hintText={'Password'}
              type={'password'}
              onChange={this.onChangePassword.bind(this)}
              style={styles.form}
            /><br/>
          </div>
          <div>
            <RaisedButton
              className={'form-control'}
              label={'Login'}
              onClick={this.handleLoginClick.bind(this)}
              primary={true}
              style={styles.action}
            />
          </div>
          <div style={{ margin: '10px 0' }}>
            <Link to='/forgot-password'>{'Forgot password?'}</Link>
          </div>
          <div style={{ margin: '10px 0' }}>
            {"Don't have an account? "}
            <Link to='/register' onClick={this.clearErrors.bind(this)}>{'Sign up'}</Link>
          </div>
        </div>
      </div>
    )
  }

  clearErrors (event) {
    this.props.clearAuthErrors()
  }

  onChangeUsername (event) {
    this.setState({ email: event.target.value })
  }

  onChangePassword (event) {
    this.setState({ password: event.target.value })
  }

  handleLoginClick (event) {
    const email = (this.state && this.state.email) ? this.state.email : ''
    const password = (this.state && this.state.password) ? this.state.password : ''
    const creds = { username: email, password: password }
    this.props.onLoginClick(creds, this.props.location.search)
  }

  linkToSignup (event) {
    this.props.linkToSignup()
  }
}

Login.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
  onCreateAccountClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}

export default Login
