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

const styles = {
  slider: {
    flex: '2 1 auto'
  },
  sliderValue: {
    position: 'relative',
    fontSize: '14px',
    fontFamily: 'Roboto,sans-serif',
    fontWeight: 'bold',
    flex: '0 1 auto',
    bottom: '7px',
    marginLeft: '15px',
    marginRight: '20px'
  },
  action: {
    flex: '2 1 auto'
  }
}

const GMSliderName = React.createClass({
  render: function() {
    var labelStyle = {
      position: 'absolute',
      fontSize: '13px',
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 'bold',
    };

    var slider = document.getElementById('slider');
    if (slider) {
      var sliderBounds = slider.getBoundingClientRect();
      var left = slider.offsetLeft;
      labelStyle.left = left + 'px';
      labelStyle.bottom = '15px';
      labelStyle.visibility = 'visible';
    } else {
      labelStyle.visibility = 'hidden';
    }

    return (
      <span style={labelStyle}>CORRELATION THRESHOLD</span>
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
  subsetSelector: function(event) {
    this.props.subset.subsetSelector(event);
  },
  render: function () {
    return (
      <div>
        <GMToolbar
          open={this.state.open}
          height={60}
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
          <FlatButton
            label='Create a subset'
            icon={<FontIcon className='material-icons'>add</FontIcon>}
            style={styles.action}
            onClick={this.props.subsetSelector}
          />
          <FlatButton
            label='Sort'
            icon={<FontIcon className='material-icons'>sort</FontIcon>}
            style={styles.action}
          />
          <GMProjectSearch />
        </GMToolbar>
      </div>
    )
  }
})

export default GMMatrixToolbar
