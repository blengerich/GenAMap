import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Avatar from 'material-ui/Avatar'
import AppBar from 'material-ui/AppBar'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

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
    backgroundImage: 'url(./images/dna.jpg)',
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
    minWidth: '500px',
    minHeight: '500px',
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
  initialState () {
    return {open: false}
  }
  constructor (props, context) {
    super(props, context)
    this.state = this.initialState()
  }
  handleOpen () {
    this.setState({open: true})
  }

  handleClose () {
    this.setState({open: false})
  }
  render () {
    const { errorMessage } = this.props
    const logosrc = 'images/' + logos[0]
    const actions = [
      <FlatButton
        label="OK"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />
    ]
    return (
      <div style={styles.background}>
        <div style={styles.body}>
          <AppBar
            title=''
            style={styles.appBar}
            showMenuIconButton={false}
          >
            <Avatar src={logosrc} style={{alignSelf: 'center', border: 'none', order: 0}} />
            <h1 style={styles.header}>GenAMap</h1>
          </AppBar>
          <p style={{ 'fontSize': '1.8em' }}>Forget Password</p>
          <div>
            <TextField
              className={'form-control'}
              hintText={'Email Address'}
              type={'email'}
              errorText={errorMessage}
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
            <Dialog
              actions={actions}
              modal={false}
              open={this.state.open}
              onRequestClose={this.handleClose.bind(this)}
            >
            {(!errorMessage)?
              <div>
                Your email has sent succesfully
              </div>
              :
              <div>
              {errorMessage}
              </div>
            }
            </Dialog>
          </div>
          <div style={{ margin: '10px 0' }}>
            {"Remembered the password? "}
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
    const creds = { email }
    this.props.onForgetPasswordClick(creds)
    const { errorMessage } = this.props
    this.setState({open: true})
  }
}
ForgetPassword.propTypes = {
  onForgetPasswordClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string
}

export default ForgetPassword
