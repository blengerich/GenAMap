import React, { Component, PropTypes } from 'react'
import Popover from 'material-ui/lib/popover/popover'
import Menu from 'material-ui/lib/menus/menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import TextField from 'material-ui/lib/text-field'
import config from '../../config'

const styles = {
  popover: {
    minWidth: '150px'
  }
}

const GMSetting = React.createClass({
  getInitialState: function () {
    return {
      open: this.props.open,
      FormerPassword: '',
      NewPassword: '',
      NewPassword2: ''
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open
    })
  },
  handleRequestClose: function () {
    this.props.onSettingClose()
  },
  validateForm: function(){
    return (!!this.state.FormerPassword &&
            !!this.state.NewPassword &&
            !!this.state.NewPassword2)
  },
  handleSubmit: function() {
    const Password0 = (this.state && this.state.FormerPassword) ? this.state.FormerPassword : ''
    const Password1 = (this.state && this.state.NewPassword) ? this.state.NewPassword : ''
    const Password2 = (this.state && this.state.NewPassword2) ? this.state.NewPassword2 : ''
    const creds = {Password0, Password1, Password2}
    this.props.onClickChangePassword(creds)
  },
  onChangeFormerPassword: function(event) {
    this.setState({FormerPassword: event.target.value})
  },
  onChangeNewPassword: function(event) {
    this.setState({NewPassword: event.target.value})
  },
  onChangeConfirmNewPassword: function(event) {
    this.setState({NewPassword2: event.target.value})
  },
  render: function () {
    const {errorMessage , accountname} = this.props
    console.log(errorMessage)
    console.log(accountname)
    console.log(this.props)
    var actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onClick={this.handleRequestClose}
      />,
      <FlatButton
        label='Change'
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit}
        disabled={!this.validateForm()}
      />
    ]
    return (
      <Dialog
        autoScrollBodyContent={true}
        className='gm-dialog__ChangePassword'
        title='Change Password'
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleRequestClose}
      >
      <form name='ChangePassword'>
        <div>
        <TextField
          id='FormerPassword'
          type={'password'}
          value={this.state.FormerPassword}
          hintText='Enter Former Password'
          errorText={!this.state.FormerPassword && errorMessage}
          onChange={this.onChangeFormerPassword}
        />
        </div>
        <div>
        <TextField
          id='NewPassword'
          type={'password'}
          value={this.state.NewPassword}
          hintText='Enter New Password'
          errorText={!this.state.NewPassword && errorMessage}
          onChange={this.onChangeNewPassword}
        />
        <br />
        <TextField
          id='ConfirmNewPassword'
          type={'password'}
          value={this.state.NewPassword2}
          hintText='Enter New Password'
          errorText={!this.state.NewPassword2 && errorMessage}
          onChange={this.onChangeConfirmNewPassword}
        />
        </div>
      </form>
      </Dialog>
    )
  }
})

export default GMSetting
