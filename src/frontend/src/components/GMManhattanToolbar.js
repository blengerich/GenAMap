import React from 'react'
import AutoComplete from 'material-ui/lib/auto-complete'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'

import GMProjectSearch from './GMProjectSearch'
import GMToolbar from './GMToolbar'

const styles = {
  action: {
    flex: '0 1 auto'
  },
  icon: {
    position: 'relative',
    top: '5px'
  },
  thresholdManage: {
    flex: '0 1 auto'
  }
}

const GMManhattanThresholdUpdate = React.createClass({
  getInitialState: function() {
    return {
      pVals: []
    }
  },
  onAdd: function() {
    const curVal = +this.state.curPVal
    const vals = this.state.pVals

    if (0 <= curVal && curVal <= this.props.maxPVal)  {
      (vals.filter(e => +e === curVal).length) ?
        this.setState({ errorText: 'Threshold line already exists for ' + curVal }) :
        this.setState({ pVals: [...vals, curVal.toString()] })
    } else {
      this.setState({ errorText: 'Enter a number between 0 and ' + this.props.maxPVal })
    }
  },
  onRemove: function() {
    const curVal = +this.state.curPVal
    const vals = this.state.pVals

    if (0 <= curVal && curVal <= this.props.maxPVal)  {
      (vals.filter(e => +e === curVal).length) ?
        this.setState({ pVals: vals.filter(e => +e === curVal) }) :
        this.setState({ errorText: "Threshold line doesn't exist for " + curVal })
    } else {
      this.setState({ errorText: 'Enter a number between 0 and ' + this.props.maxPVal })
    }
  },
  onUpdateInput: function (text, dataSource) {
    this.setState({ curPVal: text, errorText: '' })
  },
  render: function() {
    return (
      <div>
        <IconButton style={styles.icon} onTouchTap={this.onAdd}>
          <FontIcon className="material-icons">add</FontIcon>
        </IconButton>
        <IconButton style={styles.icon} onTouchTap={this.onRemove}>
          <FontIcon className="material-icons">remove</FontIcon>
        </IconButton>
        <AutoComplete
          hintText='line at threshold'
          dataSource={this.state.pVals}
          onUpdateInput={this.onUpdateInput}
          errorText={this.state.errorText}
          style={this.props.style}
        />
      </div>
    )
  }
})

const GMManhattanToolbar = React.createClass({
  getInitialState: function () {
    return {
        open: true
    };
  },
  handleToggle: function () {
    this.setState({open: !this.state.open});
  },
  render: function () {
    return (
      <div>
        <GMToolbar
          open={this.state.open}
          height={70}
          left={this.props.left}
          right={this.props.right}
        >
          <GMManhattanThresholdUpdate maxPVal={50} />
          <GMProjectSearch style={styles.thresholdManager} />
        </GMToolbar>
      </div>
    )
  }
})

export default GMManhattanToolbar
