import React, { Component, PropTypes } from 'react'
import AutoComplete from 'material-ui/lib/auto-complete'
import FontIcon from 'material-ui/lib/font-icon'
import IconButton from 'material-ui/lib/icon-button'
import FlatButton from 'material-ui/lib/flat-button'
import { Link } from 'react-router'

import GMToolbar from './GMToolbar'

const styles = {
  action: {
      flex: '2 1 auto'
    },
  icon: {
    position: 'relative',
    top: '5px'
  },
  thresholdManage: {
    flex: '0 1 auto'
  }
}


class GMDendrogramToolbar extends Component {
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
    if(this.props.pageParams.markers){
      var params = this.props.pageParams
      var link = params.markers.toString() + '/' + params.traits.toString() + '/' + params.results.toString()
      return '/visualization/matrix/' + link
    }
    else{return null}
  }
  render () {
    return (
      <div>
        <GMToolbar
          open={this.state.open}
          height={70}
          left={this.props.left}
          right={this.props.right}
        >
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
        </GMToolbar>
      </div>
    )
  }
}

export default GMDendrogramToolbar
