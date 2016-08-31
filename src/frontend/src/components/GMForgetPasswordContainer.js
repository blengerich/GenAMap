import { connect } from 'react-redux'
import { loginUser, redirectTo, ForgetPassword, clearAuthErrors, confirmAccount } from '../actions'
import GMForgetPassword from './GMForgetPassword'

const mapStateToProps = (state) => ({
  errorMessage: state.userData.auth.createErrorMessage,
  confirmErrorMessage: state.userData.auth.confirmErrorMessage,
  isAuthenticated: state.userData.auth.isAuthenticated,
  verifyDialogOpen: state.userData.auth.verifyDialogOpen,
  emailToVerify: state.userData.auth.emailToVerify
})

const mapDispatchToProps = (dispatch) => ({
  clearAuthErrors: () => {
    dispatch(clearAuthErrors())
  },
  onForgetPasswordClick: (creds) => {
    const ForgetPasswordPromise = dispatch(ForgetPassword(creds))
    ForgetPasswordPromise.then(account => {
      console.log("ACCOUNT", account)
    })
  },
  submitConfirm: (creds) => {
    dispatch(confirmAccount(creds))
  }
})

const GMForgetPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMForgetPassword)

export default GMForgetPasswordContainer
