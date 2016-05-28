import { connect } from 'react-redux'
import { toggleLeftNav, toggleRightNav, logoutUser } from '../actions'
import GMApp from './GMApp'

const mapStateToProps = (state) => {
  return {
    leftNavOpen: state.ui.leftNavOpen,
    rightNavOpen: state.ui.rightNavOpen
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    leftIconTouch: () => {
      dispatch(toggleLeftNav())
    },
    rightIconTouch: () => {
      dispatch(toggleRightNav())
    },
    logout: () => {
      dispatch(logoutUser())
    }
  }
}

const GMAppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMApp)

export default GMAppContainer
