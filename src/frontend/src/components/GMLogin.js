import React, { Component, PropTypes } from 'react'
import AppBar from 'material-ui/lib/app-bar'
import RaisedButton from 'material-ui/lib/raised-button'
import TextField from 'material-ui/lib/text-field'
import Dialog from 'material-ui/lib/dialog'

import config from '../../config'

const styles = {
  action: {
    margin: '5% 5% 5% 0'
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
    height: '50%',
    textAlign: 'center'
  }
}

class Login extends Component {
  render () {
    const { errorMessage } = this.props

    return (
      <div style={styles.background}>
        <div style={styles.body}>
          <AppBar
            title='GenAMap 2.0'
            style={styles.appBar}
            showMenuIconButton={false}
          />
          <p style={{ 'fontSize': '1.8em' }}>Login to GenAMap</p>
          <div>
            <TextField
              className={'form-control'}
              hintText={'Username'}
              ref={'username'}
            /><br/>
          </div>
          <div>
            <TextField
              className={'form-control'}
              hintText={'Password'}
              type={'password'}
              ref={'password'}
            /><br/>
          </div>
          <div>
            <RaisedButton
              label={'Create Account'}
              onClick={this.handleCreateAccountClick.bind(this)}
              secondary={true}
              style={styles.action}
            />
            <RaisedButton
              label={'Login'}
              onClick={this.handleLoginClick.bind(this)}
              primary={true}
              styles={styles.action}
            />
          </div>
        </div>
      </div>
    )
  }

  handleLoginClick (event) {
    const username = this.refs.username.refs.input
    const password = this.refs.password.refs.input
    const creds = { username: username.value.trim(), password: password.value.trim() }
    this.props.onLoginClick(creds, this.props.location.search)
  }

  handleCreateAccountClick (event) {
    const username = this.refs.username.refs.input
    const password = this.refs.password.refs.input
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
