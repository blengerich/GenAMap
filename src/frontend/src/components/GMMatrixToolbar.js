import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import Badge from 'material-ui/lib/badge'
import Slider from 'material-ui/lib/slider'
import AutoComplete from 'material-ui/lib/auto-complete'
import MenuItem from 'material-ui/lib/menus/menu-item'
import Popover from 'material-ui/lib/popover/popover'
import Menu from 'material-ui/lib/menus/menu'

import GMProjectSearch from './GMProjectSearch'
import GMToolbar from './GMToolbar'
import GMManhattanDialog from './GMManhattanDialog'

const styles = {
  slider: {
    width: '500px'
  },
  sliderValue: {
    position: 'relative',
    fontSize: '14px',
    fontFamily: 'Roboto,sans-serif',
    fontWeight: 'bold',
    left: '-280px',
    bottom: '7px',
    marginLeft: '15px',
    marginRight: '20px'
  }
}

const GMSliderName = React.createClass({
  render: function() {
    var labelStyle = {
      position: 'absolute',
      fontSize: '15px',
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center'
    };

    var slider = document.getElementById('slider');
    if (slider) {
      var sliderBounds = slider.getBoundingClientRect();
      var left = slider.offsetLeft;
      labelStyle.left = left + 'px';
      labelStyle.bottom = '15px';
      labelStyle.width = sliderBounds.width;
      labelStyle.visibility = 'visible';
    } else {
      labelStyle.visibility = 'hidden';
    }

    return (
      <span style={labelStyle}>Effect Size Threshold</span>
    )
  }
})

const GMMatrixToolbar = React.createClass({
  getInitialState: function () {
    return {
        open: true,
        slider: {
          threshold: 0.0
        }
    };
  },
  handleToggle: function () {
    this.setState({open: !this.state.open});
  },
  onThresholdChange: function(event, value) {
    this.props.slider.onThresholdChange(event, value);
    this.setState({
      slider: {
        threshold: value
      }
    })
  },
  render: function () {
    console.log(this.props.pageParams)
    console.log(this.props.traitLabels)
    return (
      <div>
        <GMToolbar
          open={this.state.open}
          height={60}
          style={{overflow: 'hidden'}}
          left={this.props.left}
          right={this.props.right}
        >
          <Slider id={"slider"}
            style={styles.slider}
            onChange={this.onThresholdChange}
            defaultValue={0}
          />
          <span style={styles.sliderValue}>{this.state.slider.threshold.toFixed(2)}</span>
          <GMSliderName />
          <GMManhattanDialog
            pageParams={this.props.pageParams}
            traitLabels={this.props.traitLabels}
          />
        </GMToolbar>
      </div>
    )
  }
})

export default GMMatrixToolbar
