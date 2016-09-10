import { connect } from 'react-redux'
import { redirectTo, ForgetPassword, clearAuthErrors} from '../actions'
import GMForgetPassword from './GMForgetPassword'

const mapStateToProps = (state) => ({
  errorMessage: state.userData.auth.createErrorMessage,
  isAuthenticated: state.userData.auth.isAuthenticated
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
  }
})

const GMForgetPasswordContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMForgetPassword)

export default GMForgetPasswordContainer
