import jwt from 'jsonwebtoken'

import config from '../../config'

const TOKEN_STRING = 'id_token'

export const getToken = () => window.localStorage.getItem(TOKEN_STRING)
export const removeToken = () => window.localStorage.removeItem(TOKEN_STRING)
export const getTokenContent = (token) => {
  try {
    const decoded = jwt.verify(token, config.secret)
    return decoded
  } catch (error) {
    return
  }
}
export const verifyToken = (token) => {
  if (!getTokenContent(token)) return false
  const userId = extractFromToken(token, 'id')
  return verifyUser(userId)
}
export const getAndVerifyToken = () => {
  const token = getToken()
  return verifyToken(token)
}
export const extractFromToken = (token, param) => {
  const tokenContent = getTokenContent(token)
  return tokenContent[param]
}
export const setToken = (token) => window.localStorage.setItem(TOKEN_STRING, token)
export const createToken = (content) => jwt.sign(content, config.secret, { expiresIn: '5h' })
const verifyUser = (userId) => true
