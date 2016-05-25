import { connect } from 'react-redux'
import { toggleLeftNav, toggleRightNav } from '../actions'
import LoggedIn from './LoggedIn'

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
    }
  }
}

const LoggedInContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoggedIn)

export default LoggedInContainer

