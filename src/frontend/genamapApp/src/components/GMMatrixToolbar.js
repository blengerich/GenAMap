import React from 'react'
import FontIcon from 'material-ui/lib/font-icon'
import FlatButton from 'material-ui/lib/flat-button'
import Badge from 'material-ui/lib/badge'
import Slider from 'material-ui/lib/slider'
import AutoComplete from 'material-ui/lib/auto-complete'
import MenuItem from 'material-ui/lib/menus/menu-item'
import Popover from 'material-ui/lib/popover/popover'
import Menu from 'material-ui/lib/menus/menu'

import GMToolbar from './GMToolbar'

const styles = {
  slider: {
    flex: '3 1 auto'
  },
  action: {
    flex: '0 1 auto'
  }
}

const GMProjectSearch = React.createClass({
  getInitialState: function () {
    return {dataSource: ['a']}
  },
  componentWillReceiveProps: function (nextProps) {
    var newState = {}
    if (nextProps.data !== null) newState.data = nextProps.data
    this.setState(newState)
  },
  render: function () {
    return (
      <AutoComplete
        hintText='Search for files'
        dataSource={this.state.dataSource}
        filter={AutoComplete.caseInsensitiveFilter}
        style={{width: 'inherit'}}
      />
    )
  }
})
//rgb(0, 188, 212)
const GMSliderTooltip = React.createClass({
  render: function() {
    var toolTipStyle = {
      "position": "absolute",
      "fontSize": "12px",
      "fontFamily": "sans-serif",
      "fontWeight": "bold",
      "left": 0
    };

    var slider = document.getElementById('slider');
    if (slider) {
      var sliderBounds = slider.getBoundingClientRect();
      var left = slider.offsetLeft + sliderBounds.width;
      var top = slider.offsetTop;
      toolTipStyle.left = left + "px";
    }

    return (
      <div style={toolTipStyle}>
          {this.props.value}
      </div>
    )
  }
})

const GMMatrixToolbar = React.createClass({
  getInitialState: function () {
    return {
        open: true,
        vizSelect: {
          open: false
        },
        slider: {
          threshold: 0.0
        }
    };
  },
  handleToggle: function () {
    this.setState({open: !this.state.open});
  },
  openVizMenu: function(e) {
    e.preventDefault();
    this.setState({
      vizSelect: {
        open: true,
        anchor: e.currentTarget
      }
    });
  },
  closeVizMenu: function() {
    this.setState({
      vizSelect: {
        open: false
      }
    });
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
    return (
      <div>
        <FlatButton label='Toggle Toolbar' onTouchTap={this.handleToggle} />
        <GMToolbar
          open={this.state.open}
          height={100}
          left={this.props.left}
          right={this.props.right}
        >
          <Slider id={"slider"} style={styles.slider} onChange={this.onThresholdChange} />
          <span style={{ "position": "relative", "marginLeft": "10px", "bottom": "10px" }}>0.5</span>
          <FlatButton
            label="Switch visualization"
            icon={<FontIcon className="material-icons">show_chart</FontIcon>}
            onTouchTap={this.openVizMenu}
            style={styles.action}
          />
          <Popover
            open={this.state.vizSelect.open}
            anchorEl={this.state.vizSelect.anchor}
            onRequestClose={this.closeVizMenu}
          >
            <Menu>
                <MenuItem primaryText="Matrix View" />
                <MenuItem primaryText="Dendrogram" />
                <MenuItem primaryText="Manhattan Plot" />
                <MenuItem primaryText="Population Analysis" />
            </Menu>
          </Popover>
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
