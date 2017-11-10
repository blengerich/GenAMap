import { CLEAR_AUTH_ERRORS, LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS, ERROR_CREATE_ACCOUNT,
          RECEIVE_CREATE_ACCOUNT, RECEIVE_FORGET_PASSWORD, ERROR_FORGET_PASSWORD, ERROR_FORGET_PASSWORD_EMAIL, ERROR_CONFIRM_ACCOUNT, ERROR_CONFIRM_ACCOUNT_LINK,
          RECEIVE_CONFIRM_ACCOUNT, RECEIVE_CONFIRM_ACCOUNT_LINK, CHANGE_PASSWORD, CHANGE_PASSWORD_ERROR } from '../actions'
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
    case RECEIVE_FORGET_PASSWORD:
      return{
        isAuthenticated: false,
        email: action.email
      }
    case ERROR_FORGET_PASSWORD:
      return {
        isAuthenticated: false,
        createErrorMessage: action.message
      }
    case ERROR_FORGET_PASSWORD_EMAIL:
      return {
        isAuthenticated: false,
        createErrorMessage: action.message
      }
    case ERROR_CONFIRM_ACCOUNT:
      return {
        isAuthenticated: false,
        confirmErrorMessage: action.message
      }
    case ERROR_CONFIRM_ACCOUNT_LINK:
      return {
        isAuthenticated: false,
        loginErrorMessage: action.message
      }
    case RECEIVE_CONFIRM_ACCOUNT:
      return {
        isAuthenticated: false,
        emailVerified: action.email
      }
    case RECEIVE_CONFIRM_ACCOUNT_LINK:
      return {
        isAuthenticated: false,
        emailVerified: action.email
      }
    case CHANGE_PASSWORD:
     return{
       changePasswordEmail: action.email
     }
    case CHANGE_PASSWORD_ERROR:
     return{
       changepasswordError: action.message
     }
    default:
      return state
  }
}

export default auth
