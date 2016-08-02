import { connect } from 'react-redux'

import { runAnalysis } from '../actions'
import GMRunAnalysisDialog from './GMRunAnalysisDialog'

const mapStateToProps = (state, ownProps) => ({
  projects: state.userData.projects,
  open: ownProps.open,
  onClose: ownProps.onClose,
})

const mapDispatchToProps = (dispatch) => ({
  submit: (data) => {
    dispatch(runAnalysis(data))
  },
  importSNP: (data) => {
    dispatch(importData(data))
  }
})

const GMRunAnalysisDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMRunAnalysisDialog)

export default GMRunAnalysisDialogContainer
