import React from 'react'
import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import LinearProgress from 'material-ui/lib/linear-progress'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'

const styles = {
  flexWrapper: {
    display: 'flex'
  },
  flexItem: {
    flex: '1 1 auto'
  },
  flexItemPrimary: {
    flex: '1 1 50%'
  },
  primaryuText: {
  },
  secondaryText: {
    fontSize: '14px',
    lineHeight: '16px',
    height: '16px',
    margin: 0,
    marginTop: '4px',
    color: 'rgba(0, 0, 0, 0.54)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    muiPrepared: ''
  },
  progress: {
    flex: '1 1 auto',
    width: '50%'
  }
}

const buttonFromText = (text, onFocus) =>
  <IconButton tooltip={text} tooltipPosition='bottom-center' onFocus={onFocus}>
    <FontIcon className='material-icons'>{text}</FontIcon>
  </IconButton>

const GMActivity = React.createClass({
  render: function () {
    const cancelButton = buttonFromText(
      'cancel',
      () => this.props.actions.onCancelClick(this.props.activity)
    )
    var calculatedProgress = (this.props.activity.progress*100.0).toFixed(1) + '%'
    if (calculatedProgress == "-100.0%") {
      calculatedProgress = "ERROR";
    }
    return (
      <ListItem disabled={true} rightIconButton={cancelButton}>
        <div style={styles.flexWrapper}>
          <div style={styles.flexItem}>
            <div style={styles.primaryText}>{this.props.activity.name}</div>
            <div style={styles.secondaryText}>{this.props.activity.info}</div>
          </div>
          <div style={styles.flexItemPrimary}>
            <LinearProgress mode='determinate' value={this.props.activity.progress} />
            <span style={styles.secondaryText}>{calculatedProgress}</span>
          </div>
        </div>
      </ListItem>
    )
  }
})

const GMActivityList = React.createClass({
  render: function () {
    return (
      <List>
        {this.props.activities.map((activity, i) =>
          <GMActivity
            key={i}
            activity={activity}
            actions={this.props.actions}
          />
        )}
      </List>
    )
  }
})

export default GMActivityList
