import { connect } from 'react-redux'

import { deleteFile, downloadFile, importData, renameFile } from '../actions'
import GMProjectMenu from './GMProjectMenu'

const mapStateToProps = (state) => ({
  projects: state.userData.projects
})

const mapDispatchToProps = (dispatch) => ({
  projectActions: {
    deleteFile: (id) => {
      dispatch(deleteFile(id))
    },
    downloadFile: (id) => {
      dispatch(downloadFile(id))
    },
    renameFile: (id) => {
      dispatch(renameFile(id))
    }
  },
  importDataSubmit: (data) => {
    dispatch(importData(data))
  }
})

const GMProjectMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMProjectMenu)

export default GMProjectMenuContainer
