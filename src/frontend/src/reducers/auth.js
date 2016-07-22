import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS } from '../actions'
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
        errorMessage: '',
        username: action.username,
        isUpdated: true
      }
    case LOGIN_FAILURE:
      return {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
        isUpdated: false
      }
    case LOGOUT_SUCCESS:
      return {
        isFetching: false,
        isAuthenticated: false,
        isUpdated: false
      }
    default:
      return state
  }
}

export default auth
