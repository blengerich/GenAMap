import { connect } from 'react-redux'
import { loginUser, redirectTo, createAccount } from '../actions'
import GMCreateAccount from './GMCreateAccount'

const mapStateToProps = (state) => ({
  errorMessage: state.userData.auth.errorMessage,
  isAuthenticated: state.userData.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch) => ({
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
