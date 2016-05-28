import { connect } from 'react-redux'
import { loginUser, redirectTo } from '../actions'
import GMLogin from './GMLogin'

const parseQuery = (query) => {
  let o = {}
  const q = (query.slice(0, 1) === '?') ? query.slice(1) : query
  const vars = q.split('&')
  vars.forEach((p) => {
    const keyValuePair = p.split('=')
    o[keyValuePair[0]] = keyValuePair[1]
  })
  return o
}

const getParam = (queryObject, name) => {
  return queryObject[name]
}

const mapStateToProps = (state) => ({
  errorMessage: state.auth.errorMessage,
  isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = (dispatch) => ({
  onLoginClick: (creds, query) => {
    const loginPromise = dispatch(loginUser(creds))
    loginPromise.then(login => {
      if (login) {
        const p = parseQuery(query)
        const nextUrl = (!getParam(p, 'next'))
          ? '/'
          : getParam(p, 'next')
        dispatch(redirectTo(nextUrl))
      }
    })
  }
})

const GMLoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMLogin)

export default GMLoginContainer

