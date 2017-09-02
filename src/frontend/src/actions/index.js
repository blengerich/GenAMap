import {hashHistory} from 'react-router'

import fetch from '../components/fetch'
import config from '../../config'
import {removeToken, extractFromToken, setToken} from '../middleware/token'

/*
 * action types
 */
export 
export const IMPORT_DATA = 'IMPORT_DATA'
export const IMPORT_DATA_REQUEST = 'IMPORT_DATA_REQUEST'
export const IMPORT_DATA_RECEIVE = 'IMPORT_DATA_RECEIVE'
export const RUN_ANALYSIS_REQUEST = 'RUN_ANALYSIS_REQUEST'
export const RUN_ANALYSIS_RECEIVE = 'RUN_ANALYSIS_RECEIVE'
export const TOGGLE_LEFT_NAV = 'TOGGLE_LEFT_NAV'
export const TOGGLE_RIGHT_NAV = 'TOGGLE_RIGHT_NAV'
export const DELETE_FILE = 'DELETE_FILE'
export const STAR_FILE = 'STAR_FILE'
export const ADD_ACTIVITY = 'ADD_ACTIVITY'
export const CANCEL_ACTIVITY = 'CANCEL_ACTIVITY'
export const PAUSE_ACTIVITY = 'PAUSE_ACTIVITY'
export const RESTART_ACTIVITY = 'RESTART_ACTIVITY'
export const REQUEST_UPDATE_ACTIVITY = 'REQUEST_UPDATE_ACTIVITY'
export const RECEIVE_UPDATE_ACTIVITY = 'RECEIVE_UPDATE_ACTIVITY'
export const RECEIVE_ANALYSIS_RESULTS = 'RECEIVE_ANALYSIS_RESULTS'
export const REQUEST_CREATE_ACCOUNT = 'REQUEST_CREATE_ACCOUNT'
export const RECEIVE_CREATE_ACCOUNT = 'RECEIVE_CREATE_ACCOUNT'
export const RECEIVE_FORGET_PASSWORD = 'RECEIVE_FORGET_PASSWORD'
export const ERROR_FORGET_PASSWORD = 'ERROR_FORGET_PASSWORD'
export const ERROR_FORGET_PASSWORD_EMAIL = 'ERROR_FORGET_PASSWORD_EMAIL'
export const RECEIVE_CONFIRM_ACCOUNT = 'RECEIVE_CONFIRM_ACCOUNT'
export const RECEIVE_CONFIRM_ACCOUNT_LINK = 'RECEIVE_CONFIRM_ACCOUNT_LINK'
export const CLEAR_AUTH_ERRORS = 'CLEAR_AUTH_ERRORS'
export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'
export const ERROR_CREATE_ACCOUNT = 'ERROR_CREATE_ACCOUNT'
export const ERROR_CONFIRM_ACCOUNT = 'ERROR_CONFIRM_ACCOUNT'
export const ERROR_CONFIRM_ACCOUNT_LINK = 'ERROR_CONFIRM_ACCOUNT_LINK'
export const SHOW_LOCK = 'SHOW_LOCK'
export const LOCK_SUCCESS = 'LOCK_SUCCESS'
export const LOCK_FAILURE = 'LOCK_FAILURE'
export const REDIRECT = 'REDIRECT'
export const USER_STATE_SUCCESS = 'USER_STATE_SUCCESS'
export const USER_STATE_FAILURE = 'USER_STATE_FAILURE'
export const LOAD_INITIAL_PROJECTS = 'LOAD_INITIAL_PROJECTS'
export const LOAD_INITIAL_ACTIVITIES = 'LOAD_INITIAL_ACTIVITIES'
export const CHANGE_PASSWORD = 'CHANGE_PASSWORD'
export const CHANGE_PASSWORD_ERROR = 'CHANGE_PASSWORD_ERROR'

/*
 * action creators
 */

function importDataReceive(data) {
  return {
    type: IMPORT_DATA_RECEIVE,
    data
  }
}

function createFormData(form) {
  let formData = new window.FormData()
  for (var i = 0; i < form.length; i++) {
    if (form.elements[i].id) {
      if (form.elements[i].type === 'file') {
        formData.append(form.elements[i].id, form.elements[i].files[0])
      } else {
        formData.append(form.elements[i].id, form.elements[i].value)
      }
    }
  }
  return formData
}


export function importData(form) {
  let importDataRequest = {
    method: 'POST',
    body: createFormData(form)
  }

  return (dispatch) => {
    return fetch(config.api.importDataUrl, importDataRequest)
      .then(response => {
        if (!response.ok) Promise.reject('Could not import data')
        return response.json()
      })
      .then(data => {
        dispatch(importDataReceive(data))
        Promise.resolve(data)
      }).catch(err => console.log(err))
  }
}

function runAnalysisRequest(data) {
  return {
    type: RUN_ANALYSIS_REQUEST,
    data
  }
}

function runAnalysisReceive(data) {
  return {
    type: RUN_ANALYSIS_RECEIVE,
    data
  }
}





export function runAnalysis(data) {
  let runAnalysisRequestInit = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }

  return (dispatch) => {
    dispatch(runAnalysisRequest(data))
    return fetch(config.api.runAnalysisUrl, runAnalysisRequestInit)
      .then(response => {
        if (!response.ok) {
          Promise.reject(response.json())
        } else {
          return response.json()
        }
      }).then(json => {
        var activity = {
          id: json.jobId,
          name: data.jobName,
          projectId: data.project,
          resultsPath: json.resultsPath
        }
        dispatch(addActivity(activity))
      }).catch(err => console.log('Error: ', err))
  }
}

export function toggleLeftNav() {
  return {
    type: TOGGLE_LEFT_NAV
  }
}

export function toggleRightNav() {
  return {
    type: TOGGLE_RIGHT_NAV
  }
}

function receiveDeleteFile(data) {
  return {
    type: DELETE_FILE,
    data
  }
}

export function downloadFile(file) {
  let dataRequest = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return dispatch => {
    return fetch(`${config.api.dataUrl}/${file}`, dataRequest)
      .then(response => {
        if (!response.ok) {
          console.log('Could not download file')
          Promise.reject(response.json())
        } else {
          return response.json()
        }
      }).then(response => {
        const dataURI = 'data:text/csv;base64,' + btoa(response.data.replace(/\n/g, '\r\n'))
        var link = document.createElement('a')
        link.download = response.file.path.substring(response.file.path.lastIndexOf('/') + 1)
        link.href = dataURI
        link.click()
      })
  }
}

export function deleteFile(file) {
  let request = {
    method: 'DELETE'
  }

  return dispatch => {
    return fetch(`${config.api.dataUrl}/${file}`, request)
      .then(response => {
        if (!response.ok) {
          console.log('Could not delete file')
          Promise.reject(response.json())
        } else {
          return response.json()
        }
      }).then(json => {
        dispatch(receiveDeleteFile(json))
      })
  }
}

export function starFile(file) {
  return {
    type: STAR_FILE,
    file
  }
}

export function addActivity(activity) {
  return {
    type: ADD_ACTIVITY,
    id: activity.id,
    name: activity.name,
    projectId: activity.projectId,
    resultsPath: activity.resultsPath
  }
}

export function cancelActivity(activity) {
  if (!activity.completed) {
    let postCancelActivityRequest = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        jobId: activity.id,
      })
    }
    fetch(`${config.api.cancelJobUrl}`, postCancelActivityRequest).then((response) => {
      return {
        type: CANCEL_ACTIVITY,
        id: activity.id
      }
    })
  } else {
    return {
      type: CANCEL_ACTIVITY,
      id: activity.id
    }
  }
}

export function pauseActivity(activity) {
  return {
    type: PAUSE_ACTIVITY,
    activity
  }
}

export function restartActivity(activity) {
  return {
    type: RESTART_ACTIVITY,
    activity
  }
}

export function restartActivityAsync(activity) {
  return (dispatch) => {
    dispatch(restartActivity(activity))
    setTimeout(() => {
      dispatch(fetchUpdateActivityIfNeeded(activity))
    }, 1000)
  }
}

export function requestUpdateActivity(activity) {
  return {
    type: REQUEST_UPDATE_ACTIVITY,
    activity
  }
}

export function receiveUpdateActivity(activity, response) {
  return {
    type: RECEIVE_UPDATE_ACTIVITY,
    id: activity.id,
    name: activity.name,
    progress: response.progress,
    projectId: activity.projectId,
    resultsPath: activity.resultsPath
  }
}

export function fetchUpdateActivity(activity) {
  return (dispatch) => {
    dispatch(requestUpdateActivity(activity))
    let getActivityRequest = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    return fetch(`${config.api.getActivityUrl}/${activity.id}`, getActivityRequest)
      .then(response => {
        if (!response.ok) {
          console.log('Could not fetch activity for activity ', activity)
        } else {
          return response.json()
        }
      }).then(response => {
        dispatch(receiveUpdateActivity(activity, response))
        if (response.progress === 1) {
          dispatch(requestAnalysisResults(activity))
        }
      })
  }
}

function requestAnalysisResults(activity) {
  return (dispatch) => {
    let getResultsRequest = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        projectId: activity.projectId,
        resultsPath: activity.resultsPath
      })
    }

    return fetch(`${config.api.getAnalysisResultsUrl}`, getResultsRequest)
      .then(response => {
        if (!response.ok) {
          console.log('Could not fetch analysis results for Job', activity.id)
        } else {
          return response.json()
        }
      }).then(json => {
        dispatch(receiveAnalysisResults(json))
      })
  }
}

function receiveAnalysisResults(data) {
  return {
    type: RECEIVE_ANALYSIS_RESULTS,
    data
  }
}

function shouldUpdateActivity(state, activity) {
  return (activity.status !== 'completed')
}

export function fetchUpdateActivityIfNeeded(activity) {
  return (dispatch, getState) => {
    if (shouldUpdateActivity(getState(), activity)) {
      Promise.reject(activity)
      return dispatch(fetchUpdateActivity(activity))
    } else {
      Promise.resolve()
    }
  }
}

export function clearAuthErrors() {
  return {
    type: CLEAR_AUTH_ERRORS
  }
}

function requestLogin(credentials) {
  return {
    type: LOGIN_REQUEST,
    isFetching: true,
    isAuthenticated: false
  }
}

function receiveLogin(user) {
  return {
    type: LOGIN_SUCCESS,
    isFetching: false,
    isAuthenticated: true
  }
}

function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    isFetching: false,
    isAuthenticated: false,
    message
  }
}

function loadInitialProjects(data) {
  return {
    type: LOAD_INITIAL_PROJECTS,
    data
  }
}

function loadInitialActivities(data) {
  return {
    type: LOAD_INITIAL_ACTIVITIES,
    data
  }
}

function receiveUserState(state) {
  return dispatch => {
    dispatch(loadInitialProjects(state.userData.projects))
    dispatch(loadInitialActivities(state.userData.activities))
  }
}

function userStateError() {
  return {
    type: USER_STATE_FAILURE
  }
}

function receiveChangePassword(email) {
  return {
    type: CHANGE_PASSWORD,
    email
  }
}

function ChangePasswordError(message) {
  return {
    type: CHANGE_PASSWORD_ERROR,
    message
  }
}

export function loginUser(creds) {
  let loginRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `email=${creds.email}&password=${creds.password}`
  }

  return dispatch => {
    dispatch(requestLogin(creds))

    return fetch(config.api.createSessionUrl, loginRequest)
      .then(response => response.json().then(user => ({user, response})))
      .then(({user, response}) => {
        if (!response.ok) {
          dispatch(loginError(user.message))
          return Promise.reject('Could not login user')
        } else {
          setToken(user.id_token)
          dispatch(receiveLogin(user))
          dispatch(setInitialUserState(user.id_token))
          return user
        }
      }).catch(err => console.log("Error: ", err))
  }
}

export function setInitialUserState(token) {
  return dispatch => {
    let initialUserStatePromise = dispatch(getUserState(token))
    initialUserStatePromise.then(state => {
      dispatch(receiveUserState(state))
    })
  }
}

export function getUserState(token) {
  let getUserStateRequest = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return dispatch => {
    const userId = extractFromToken(token, 'id')
    return fetch(`${config.api.saveUrl}/${userId}`, getUserStateRequest)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          dispatch(userStateError())
          Promise.reject({error: 'Could not get state'})
        }
      }).then((state) => {
          return state
        }
      ).catch(error => {
        console.log('error', error)
      })
  }
}

function requestCreateAccount(email) {
  return {
    type: 'REQUEST_CREATE_ACCOUNT',
    email
  }
}

function receiveCreateAccount(account) {
  return {
    type: 'RECEIVE_CREATE_ACCOUNT',
    email: account.email
  }
}

function createAccountError(message) {
  return {
    type: 'ERROR_CREATE_ACCOUNT',
    message
  }
}

function receiveForgerPassword(user) {
  return {
    type: 'RECEIVE_FORGET_PASSWORD',
    email: user.email
  }
}

function ForgetPasswordError(message) {
  return {
    type: 'ERROR_FORGET_PASSWORD',
    message
  }
}

export function createAccount(creds) {
  let createAccountRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `email=${creds.email}&password=${creds.password}&password2=${creds.password2}&organization=${creds.organization}`
  }
  return dispatch => {
    return fetch(config.api.createAccountUrl, createAccountRequest)
      .then(response => response.json().then(account => ({account, response})))
      .then(({account, response}) => {
        if (!response.ok) {
          dispatch(createAccountError(account.message))
          return Promise.reject(account.message)
        } else {
          dispatch(receiveCreateAccount(account))
          dispatch(requestUserConfirm(account))
          Promise.resolve(account)
        }
      }).catch(err => console.log("Error: ", err))
  }
}

function requestUserConfirm(account) {
  let sendUserConfirmRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `email=${account.email}&code=${account.id}`
  }
  return dispatch => {
    return fetch(config.api.requestUserConfirmUrl, sendUserConfirmRequest)
      .then(response => {
        if (!response.ok) {
          dispatch(requestUserConfirmError(response.json().message))
          return Promise.reject('Error sending confirmation email to user')
        }
      }).catch(err => console.log("Error: ", err))
  }
}

function requestUserConfirmError(message) {
  return {
    type: 'REQUEST_USER_CONFIRM_ERROR',
    message
  }
}

function receiveConfirmAccount(account) {
  return {
    type: 'RECEIVE_CONFIRM_ACCOUNT',
    email: account.email
  }
}

function confirmAccountError(message) {
  return {
    type: 'ERROR_CONFIRM_ACCOUNT',
    message
  }
}

export function ForgetPassword(creds) {
  let ForgetPasswordRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `email=${creds.email}`
  }
  return dispatch => {
    return fetch(config.api.ForgetPasswordUrl, ForgetPasswordRequest)
      .then(response => response.json().then(account => ({account, response})))
      .then(({account, response}) => {
        if (!response.ok) {
          dispatch(ForgetPasswordError(account.message))
          return Promise.reject(account.message)
        } else {
          dispatch(receiveForgerPassword(account))
          dispatch(ForgetPasswordEmail(account))
          Promise.resolve(account)
        }
      }).catch(err => console.log("Error: ", err))
  }
}

function ForgetPasswordEmail(user) {
  let ForgetPasswordEmailRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `email=${user.email}`
  }
  return dispatch => {
    return fetch(config.api.ForgetPasswordEmailUrl, ForgetPasswordEmailRequest)
      .then(response => {
        if (!response.ok) {
          dispatch(ForgetPasswordEmailError(response.json().message))
          return Promise.reject('Error sending confirmation email to user')
        }
      }).catch(err => console.log("Error: ", err))
  }
}

function ForgetPasswordEmailError() {
  return {
    type: 'ERROR_FORGET_PASSWORD_EMAIL',
    message
  }
}

export function confirmAccount(creds) {
  let confirmAccountRequest = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return dispatch => {
    return fetch(`${config.api.confirmAccountUrl}/${creds.code}`, confirmAccountRequest)
      .then(response => response.json().then(account => ({account, response})))
      .then(({account, response}) => {
        if (!response.ok) {
          return dispatch(confirmAccountError(account.message))
        } else {
          return dispatch(receiveConfirmAccount(account))
        }
      }).then(() => {
        return dispatch(redirectTo('/login'))
      }).catch(err => console.log("Error: ", err))
  }
}

function receiveConfirmAccountFromLink(account) {
  return {
    type: 'RECEIVE_CONFIRM_ACCOUNT_LINK',
    email: account.email
  }
}

function confirmAccountFromLinkError(message) {
  return {
    type: 'ERROR_CONFIRM_ACCOUNT_LINK',
    message
  }
}

export function confirmAccountFromLink(creds) {
  let confirmAccountRequest = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return dispatch => {
    return fetch(`${config.api.confirmAccountUrl}/${creds.code}`, confirmAccountRequest)
      .then(response => response.json().then(account => ({account, response})))
      .then(({account, response}) => {
        if (!response.ok) {
          return dispatch(confirmAccountFromLinkError(account.message))
        } else {
          return dispatch(receiveConfirmAccountFromLink(account))
        }
      }).then(() => {
        return dispatch(redirectTo('/login'))
      }).catch(err => console.log("Error: ", err))
  }
}

function requestLogout() {
  return {
    type: LOGOUT_REQUEST,
    isFetching: true,
    isAuthenticated: true
  }
}

function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS,
    isFetching: false,
    isAuthenticated: false
  }
}

export function logoutUser() {
  return (dispatch) => {
    dispatch(requestLogout())
    removeToken()
    dispatch(receiveLogout())
    dispatch(redirectToLogin())
  }
}

export function redirectTo(url) {
  return (dispatch) => {
    hashHistory.push(url)
    dispatch(redirect(url))
  }
}

function redirect(url) {
  return {
    type: REDIRECT,
    url
  }
}

export function redirectToLogin(next) {
  return (dispatch) => {
    const to = (!next)
      ? config.api.loginUrl
      : config.api.loginUrl + '?next=' + next
    dispatch(redirectTo(to))
  }
}

export function ChangePassword(creds) {
  let ChangePasswordRequest = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `FormerPassword=${creds.Password0}&NewPassword=${creds.Password1}&ConfirmNewPassword=${creds.Password2}`
  }
  return (dispatch) => {
    return fetch(config.api.ChangePasswordUrl, ChangePasswordRequest)
      .then(response => response.json().then(account => ({account, response})))
      .then(({account, response}) => {
        if (!response.ok) {
          return dispatch(redirectTo('/error/' + account.message))
        } else {
          console.log('success')
        }
      }).catch(err => console.log("Error: ", err))
  }
}
