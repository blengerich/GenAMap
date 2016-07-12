import { connect } from 'react-redux'
import { cancelActivity, pauseActivity, fetchUpdateActivity } from '../actions'
import GMActivities from './GMActivities'

const getRunningActivities = (activities) => {
  return activities.filter((activity) =>
    activity.status === 'running' || activity.status === 'paused'
  )
}

const getCompletedActivities = (activities) => {
  return activities.filter((activity) => activity.status === 'completed')
}

const mapStateToProps = (state, ownProps) => {
  return {
    runningActivities: getRunningActivities(state.userData.activities),
    completedActivities: getCompletedActivities(state.userData.activities),
    allActivities: state.userData.activities,
    open: ownProps.open,
    anchorEl: ownProps.anchorEl,
    onActivityClose: ownProps.onActivityClose,
    anchorOrigin: ownProps.anchorOrigin,
    targetOrigin: ownProps.targetOrigin,
    onRequestClose: ownProps.onRequestClose
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    activityActions: {
      onCancelClick: (id) => {
        dispatch(cancelActivity(id))
      },
      onPauseClick: (id) => {
        dispatch(pauseActivity(id))
      },
      onFetchUpdateActivity: (id) => {
        dispatch(fetchUpdateActivity(id))
      }
    }
  }
}

const GMActivitiesContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMActivities)

export default GMActivitiesContainer
