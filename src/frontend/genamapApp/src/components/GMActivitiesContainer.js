import { connect } from 'react-redux'
import { cancelActivity, pauseActivity } from '../actions'
import GMActivities from './GMActivities'

const getRunningActivities = (activities) => {
  return activities.filter((activity) =>
    activity.status === 'running' || activity.status === 'paused'
  )
}

const getCompletedActivities = (activities) => {
  return activities.filter((activity) => activity.status === 'completed')
}

const mapStateToProps = (state) => {
  return {
    runningActivities: getRunningActivities(state.userwData.activities),
    completedActivities: getCompletedActivities(state.userData.activities),
    allActivities: state.user.activities
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
      }
    }
  }
}

const GMActivitiesContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GMActivities)

export default GMActivitiesContainer

