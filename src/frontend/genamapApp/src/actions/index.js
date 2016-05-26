import { GetRequest, FilePostRequest, PostRequest } from '../components/Requests'
import config from '../../config'

var request = require('request')

/*
 * action types
 */

export const IMPORT_DATA = 'IMPORT_DATA'
export const IMPORT_DATA_REQUEST = 'IMPORT_DATA_REQUEST'
export const IMPORT_DATA_RECEIVE = 'IMPORT_DATA_RECEIVE'
export const RUN_ANALYSIS_REQUEST = 'RUN_ANALYSIS_REQUEST'
export const RUN_ANALYSIS_RECEIVE = 'RUN_ANALYSIS_RECEIVE'
export const TOGGLE_LEFT_NAV = 'TOGGLE_LEFT_NAV'
export const TOGGLE_RIGHT_NAV = 'TOGGLE_RIGHT_NAV'
export const DELETE_FILE = 'DELETE_FILE'
export const STAR_FILE = 'STAR_FILE'
export const CANCEL_ACTIVITY = 'CANCEL_ACTIVITY'
export const PAUSE_ACTIVITY = 'PAUSE_ACTIVITY'
export const RESTART_ACTIVITY = 'RESTART_ACTIVITY'
export const REQUEST_UPDATE_ACTIVITY = 'REQUEST_UPDATE_ACTIVITY'
export const RECEIVE_UPDATE_ACTIVITY = 'RECEIVE_UPDATE_ACTIVITY'
export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'
export const SHOW_LOCK = 'SHOW_LOCK'
export const LOCK_SUCCESS = 'LOCK_SUCCESS'
export const LOCK_FAILURE = 'LOCK_FAILURE'

/*
 * action creators
 */

function importDataReceive (data) {
  return {
    type: IMPORT_DATA_RECEIVE,
    data
  }
}

export function importData (form) {
  return (dispatch) => {
    return FilePostRequest(config.api.importDataUrl, form, (data) => {
      dispatch(importDataReceive(data))
    })
  }
}

function runAnalysisRequest (data) {
  return {
    type: RUN_ANALYSIS_REQUEST,
    data
  }
}

function runAnalysisReceive (data) {
  return {
    type: RUN_ANALYSIS_RECEIVE,
    data
  }
}

export function runAnalysis (data) {
  console.log('DATA: ', data)
  return (dispatch) => {
    dispatch(runAnalysisRequest(data))
    return PostRequest(this.props.runAnalysisUrl, data, (processedData) => {
      dispatch(runAnalysisReceive(processedData))
    })
  }
}

export function toggleLeftNav () {
  return {
    type: TOGGLE_LEFT_NAV
  }
}

export function toggleRightNav () {
  return {
    type: TOGGLE_RIGHT_NAV
  }
}

export function deleteFile (file) {
  return {
    type: DELETE_FILE,
    file
  }
}

export function starFile (file) {
  return {
    type: STAR_FILE,
    file
  }
}

export function cancelActivity (activity) {
  return {
    type: CANCEL_ACTIVITY,
    activity
  }
}

export function pauseActivity (activity) {
  return {
    type: PAUSE_ACTIVITY,
    activity
  }
}

export function restartActivity (activity) {
  return {
    type: RESTART_ACTIVITY,
    activity
  }
}

export function restartActivityAsync (activity) {
  return (dispatch) => {
    dispatch(restartActivity(activity))
    setTimeout(() => {
      dispatch(fetchUpdateActivityIfNeeded(activity))
    }, 1000)
  }
}

export function requestUpdateActivity (activity) {
  return {
    type: REQUEST_UPDATE_ACTIVITY,
    activity
  }
}

export function receiveUpdateActivity (activity, response) {
  return {
    type: RECEIVE_UPDATE_ACTIVITY,
    activity,
    response
  }
}

function fetchUpdateActivity (activity) {
  return (dispatch) => {
    dispatch(requestUpdateActivity(activity))
    GetRequest(config.api.updateActivityURL + activity, {}, (response) => {
      dispatch(receiveUpdateActivity(activity, response))
    })
  }
}

function shouldUpdateActivity (state, activity) {
  return (activity.status !== 'completed')
}

export function fetchUpdateActivityIfNeeded (activity) {
  return (dispatch, getState) => {
    if (shouldUpdateActivity(getState(), activity)) {
      return dispatch(fetchUpdateActivity(activity))
    } else {
      return Promise.resolve()
    }
  }
}

function requestLogin (credentials) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false,
    credentials
  }
}

function receiveLogin (user) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true,
    id_token: user.id_token
  }
}

function loginError (message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message
  }
}

export function loginUser (creds) {
  let config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${creds.username}&password=${creds.password}`
  }

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestLogin(creds))
    return window.fetch('/sessions/create', config)
      .then(response =>
        response.json()
        .then(user => ({ user, response }))
      ).then(({ user, response }) => {
        if (!response.ok) {
          // If there was a problem, we want to
          // dispatch the error condition
          dispatch(loginError(user.message))
          return Promise.reject(user)
        } else {
          // If login was successful, set the token in local storage
          window.localStorage.setItem('id_token', user.id_token)

          // Dispatch the success action
          dispatch(receiveLogin(user))
        }
      }).catch(err => console.log('Error: ', err))
  }
}

function requestLogout () {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true
  }
}

function receiveLogout () {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false
  }
}

export function logoutUser () {
  return (dispatch) => {
    dispatch(requestLogout())
    window.localStorage.removeItem('id_token')
    dispatch(receiveLogout())
  }
}
