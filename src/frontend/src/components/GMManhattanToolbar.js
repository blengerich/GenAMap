import React, { Component, PropTypes } from 'react'
import AutoComplete from 'material-ui/lib/auto-complete'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'
import FlatButton from 'material-ui/lib/flat-button'
import { Link } from 'react-router'

import GMProjectSearch from './GMProjectSearch'
import GMToolbar from './GMToolbar'

const styles = {
  action: {
    float: 'left'
    },
  icon: {
    position: 'relative',
    top: '5px'
  },
  disclaimer: {
    fontFamily: 'Roboto',
    color: '#BDBDBD',
    fontSize: '0.9em'
  },
  webLinks: {
    color: '#9E9E9E',
    textDecoration: 'underline'
  },
  thresholdManage: {
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

class GMManhattanToolbar extends Component {
  initialState(){
    return {
        open: true
    }
  }

  constructor (props, context) {
    super(props, context)
    this.state = this.initialState()
  }

  handleToggle () {
    this.setState({open: !this.state.open});
  }

  getDataUrl() {
    console.log(this.props.pageParams.markers)
    if(this.props.pageParams.markers){
      var params = this.props.pageParams
      console.log( params.markers)
      var link = params.markers.toString() + '/' + params.traits.toString() + '/' + params.results.toString()
      console.log(link)
      return '/visualization/matrix/' + link
    }
    else{return null}
  }
  render () {
    console.log(this.getDataUrl())
    console.log(this.props.pageParams.markers)
    return (
      <div>
        <GMToolbar
          open={this.state.open}
          height={70}
          left={this.props.left}
          right={this.props.right}
        >
          <GMManhattanThresholdUpdate maxPVal={1} />
          {(this.getDataUrl())?
          <FlatButton
            label='Matrix Visualization'
            style={styles.action}
            icon={<FontIcon className='material-icons'>equalizer</FontIcon>}
            containerElement={<Link to= {this.getDataUrl()} />}
            linkButton={true}
          />
          :
          <FlatButton
            label='Matrix Visualization'
            style={styles.action}
            icon={<FontIcon className='material-icons'>equalizer</FontIcon>}
          />
          }
          <p style={styles.disclaimer}>GenAMap is a project of&nbsp;
            <a style={styles.webLinks} href="http://www.sailing.cs.cmu.edu/main/">Sailing Lab</a> at&nbsp;
            <a style={styles.webLinks} href="http://www.cmu.edu/">Carnegie Mellon University.</a>
          </p>
        </GMToolbar>
      </div>
    )
  }
}

export default GMManhattanToolbar
