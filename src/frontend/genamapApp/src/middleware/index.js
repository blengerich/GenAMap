import config from '../../config'

function save (state) {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  }
  return window.fetch(config.api.saveUrl, request)
    .then(response =>
      response.json()
      .then(saved => ({ saved, response }))
    ).then(({ saved, response }) => {
      if (!response.ok) {
        return Promise.reject(saved)
      } else {
        console.log("SAVED", saved)
        return Promise.resolve(saved)
      }
    }).catch(err => console.log('Error saving state: ', err))
}

const saver = store => next => action => {
  let result = next(action)
  save(store.getState())
  return result
}

export default saver
