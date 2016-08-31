import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Avatar from 'material-ui/lib/avatar'
import AppBar from 'material-ui/lib/app-bar'
import Dialog from 'material-ui/lib/dialog'
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
    height: '60%',
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

class ForgetPassword extends Component {
  render () {
    const { errorMessage } = this.props
    const logosrc = 'images/' + logos[0]
    router.get('/img', function(req, res, next) {
        var ccap = require('ccap')({
            width:400, //寬
            height:400,//高
            offset:40,//馬賽克數值
            generate:function(){//自定義生成隨機數
            this.width;
            this.height;
            return "abcdefg"
          }
        })
      })

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
          <p style={{ 'fontSize': '1.8em' }}>Forget Password</p>
          <div>
            <TextField
              className={'form-control'}
              hintText={'Email Address'}
              type={'email'}
              onChange={this.onChangeUsername.bind(this)}
              style={styles.form}
            /><br/>
          </div>
          <div>
            <img src= "/img" onclick="javascript:this.src='/img'" />
          </div>
          <div>
            <TextField
              className={'validation-code'}
              hintText={'Validation Code'}
              type={'code'}
              onChange={this.onChangeUsername.bind(this)}
              style={styles.form}
            /><br/>
          </div>
          <div>
            <RaisedButton
              label={'Send Password to my email'}
              onClick={this.handleForgetPasswordClick.bind(this)}
              primary={true}
              style={styles.action}
            />
          </div>
          <div style={{ margin: '10px 0' }}>
            {"Remember the password?"}
            <Link to='/login' onClick={this.clearErrors.bind(this)}>{'Sign in'}</Link>
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

  onChangeCode (event){
    this.setState({ code: event.target.value })
  }

  handleForgetPasswordClick (event) {
    const email = (this.state && this.state.email) ? this.state.email : ''
    const code = (this.state && this.state.code) ? this.state.code : ''
    const creds = { email, code }
    this.props.onForgetPasswordClick(creds)
  }
}

ForgetPassword.propTypes = {
  onForgetPasswordClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}

export default ForgetPassword
