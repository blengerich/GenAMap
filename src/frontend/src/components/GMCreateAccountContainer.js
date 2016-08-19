import { connect } from 'react-redux'
import { loginUser, redirectTo, createAccount, clearAuthErrors, confirmAccount } from '../actions'
import GMCreateAccount from './GMCreateAccount'

const mapStateToProps = (state) => ({
  errorMessage: state.userData.auth.createErrorMessage,
  isAuthenticated: state.userData.auth.isAuthenticated,
  verifyDialogOpen: state.userData.auth.verifyDialogOpen,
  emailToVerify: state.userData.auth.emailToVerify
})

const mapDispatchToProps = (dispatch) => ({
  clearAuthErrors: () => {
    dispatch(clearAuthErrors())
  },
  onCreateAccountClick: (creds) => {
    const createAccountPromise = dispatch(createAccount(creds))
    createAccountPromise.then(account => {
      console.log("ACCOUNT", account)
    })
  },
  submitConfirm: (creds) => {
    console.log(creds)
    dispatch(confirmAccount(creds))
  }
})

const GMCreateAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMCreateAccount)

export default GMCreateAccountContainer
