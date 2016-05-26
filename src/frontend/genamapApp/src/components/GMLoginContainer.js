import { connect } from 'react-redux'
import { login } from '../actions'
import GMLogin from './GMLogin'

const mapStateToProps = (state) => ({
  errorMessage: state.auth.errorMessage,
  isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch) => ({
  onLoginClick: (creds) => {
    dispatch(login(creds))
  }
})

const GMLoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMLogin)

export default GMLoginContainer

