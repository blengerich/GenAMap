import config from '../../config'
import fetch from '../components/fetch'
import { getAndVerifyToken } from './token'

function save (state) {
  if (getAndVerifyToken()) {
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    }
    return fetch(config.api.saveUrl, request)
    .then(saved => Promise.resolve(saved)
    ).catch(err => {
      Promise.reject('Could not save state')
      console.log('Error saving state: ', err)
    })
  }
}

const saver = store => next => action => {
  let result = next(action)
  if (action.type.indexOf('INITIAL') < 0 &&
      action.type.indexOf('LOGIN') < 0 &&
      action.type.indexOf('LOAD_INITIAL_PROJECTS') < 0 &&
      action.type.indexOf('LOAD_INITIAL_ACTIVITIES') < 0 &&
      action.type.indexOf('REDIRECT') < 0) {
    save(store.getState())
  }
  return result
}

export default saver
