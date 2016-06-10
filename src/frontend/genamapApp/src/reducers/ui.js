import { TOGGLE_LEFT_NAV, TOGGLE_RIGHT_NAV } from '../actions'

const initialUiState = {
  leftNavOpen: true,
  rightNavOpen: false
}

const ui = (state = initialUiState, action) => {
  switch (action.type) {
    case TOGGLE_LEFT_NAV:
      return Object.assign({}, state, {
        leftNavOpen: !state.leftNavOpen
      })
    case TOGGLE_RIGHT_NAV:
      return Object.assign({}, state, {
        rightNavOpen: !state.rightNavOpen
      })
    default:
      return state
  }
}

export default ui
