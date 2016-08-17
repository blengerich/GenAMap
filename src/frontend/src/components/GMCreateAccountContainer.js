import { connect } from 'react-redux'
import { loginUser, redirectTo, createAccount, clearAuthErrors } from '../actions'
import GMCreateAccount from './GMCreateAccount'

const mapStateToProps = (state) => ({
  errorMessage: state.userData.auth.createErrorMessage,
  isAuthenticated: state.userData.auth.isAuthenticated
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
  }
})

const GMCreateAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMCreateAccount)

export default GMCreateAccountContainer
