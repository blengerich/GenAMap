import { CLEAR_AUTH_ERRORS, LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS, ERROR_CREATE_ACCOUNT,
          RECEIVE_CREATE_ACCOUNT, ERROR_CONFIRM_ACCOUNT } from '../actions'
import { getAndVerifyToken } from '../middleware/token'

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.

const initialState = {
  isFetching: false,
  isAuthenticated: getAndVerifyToken(),
  isUpdated: false
}

const auth = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_AUTH_ERRORS:
      return {
        loginErrorMessage: '',
        createErrorMessage: ''
      }
    case LOGIN_REQUEST:
      return {
        isFetching: true,
        isAuthenticated: false,
        isUpdated: false
      }
    case LOGIN_SUCCESS:
      return {
        isFetching: false,
        isAuthenticated: true,
        loginErrorMessage: '',
        username: action.username,
        isUpdated: true
      }
    case LOGIN_FAILURE:
      return {
        isFetching: false,
        isAuthenticated: false,
        loginErrorMessage: action.message,
        isUpdated: false
      }
    case LOGOUT_SUCCESS:
      return {
        isFetching: false,
        isAuthenticated: false,
        isUpdated: false
      }
    case ERROR_CREATE_ACCOUNT:
      return {
        isAuthenticated: false,
        createErrorMessage: action.message
      }
    case RECEIVE_CREATE_ACCOUNT:
      return {
        isAuthenticated: false,
        verifyDialogOpen: true,
        emailToVerify: action.email
      }
    case ERROR_CONFIRM_ACCOUNT:
      return {
        isAuthenticated: false,
        confirmErrorMessage: action.message
      }
    default:
      return state
  }
}

export default auth
