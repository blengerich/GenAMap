import { connect } from 'react-redux'
import { loginUser } from '../actions'
import GMLogin from './GMLogin'

const mapStateToProps = (state) => ({
  errorMessage: state.auth.errorMessage,
  isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch) => ({
  onLoginClick: (creds) => {
    dispatch(loginUser(creds))
  }
})

const GMLoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMLogin)

export default GMLoginContainer

