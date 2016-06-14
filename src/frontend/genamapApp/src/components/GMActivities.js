import React from 'react'
import Popover from 'material-ui/lib/popover/popover'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

import GMActivityList from './GMActivityList'

const styles = {
  popover: {
    minWidth: '320px'
  },
  tabs: {
    backgroundColor: 'transparent'
  },
  tab: {
    color: '#00bcd4'
  }
}

const GMActivities = React.createClass({
  getInitialState: function () {
    return {open: this.props.open, tabValue: 'running'}
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open,
      anchorEl: nextProps.anchorEl
    })
  },
  handleRequestClose: function () {
    this.props.onActivitiesClose()
  },
  handleTabChange: function (tabValue) {
    this.setState({tabValue: tabValue})
  },
  render: function () {
    return (
      <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'middle', vertical: 'top'}}
        onRequestClose={this.handleRequestClose}
        style={styles.popover}
      >
        <Tabs
          tabItemContainerStyle={styles.tabs}
          value={this.state.tabValue}
          onChange={this.handleTabChange}
        >
          <Tab
            label='Running'
            value='running'
            style={styles.tab}
            onActive={this.handleRunning}
          >
            <GMActivityList
              activities={this.props.runningActivities}
              actions={this.props.activityActions}
            />
          </Tab>
          <Tab
            label='All'
            value='all'
            style={styles.tab}
            onActive={this.handleAll}
          >
            <GMActivityList
              activities={this.props.allActivities}
              actions={this.props.activityActions}
            />
          </Tab>
          <Tab
            label='Completed'
            value='completed'
            style={styles.tab}
            onActive={this.handleCompleted}
          >
            <GMActivityList
              activities={this.props.completedActivities}
              actions={this.props.activityActions}
            />
          </Tab>
        </Tabs>
      </Popover>
    )
  }
})

export default GMActivities
