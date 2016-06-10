import { getToken, verifyToken } from '../middleware/token'

const fetch = (path, init) => {
  const token = getToken()
  if (verifyToken(token)) {
    if (!init.headers) {
      init.headers = {
        'Authorization': `Bearer ${token}`
      }
    } else {
      init.headers = Object.assign(init.headers, {
        'Authorization': `Bearer ${token}`
      })
    }
  }
  return window.fetch(path, init)
  // .then(response => {
  //   if (response.ok) {
  //     return response.json()
  //   } else {
  //     Promise.reject(response)
  //   }
  // }).catch(error => console.log('Error: ', error))
}

export default fetch
