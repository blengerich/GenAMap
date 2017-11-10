import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'

import fetch from './fetch'
import config from '../../config'

var Graph = function(data, tree1, tree2) {
  console.log(data)
  console.log(tree1)
  console.log(tree2)
}

var GMDendrogramChart = React.createClass({
  validateNewProps(nextProps) {
    return (this.props.pageParams !== nextProps.pageParams)
  },
  componentWillReceiveProps(nextProps) {
    if (this.validateNewProps(nextProps)) {
      this.setState({
        points: Graph(nextProps.data, nextProps.tree1, nextProps.tree2)
      })
    }
  },
  getInitialState() {
    return {
      points: []
    }
  },
	render() {
		return (
      <div>
        <div id="dendrogramChart" style={{ "marginTop": "25px" }}>
        </div>
        <div id="dendrogramBottomPanel">
          <ul className="buttonContainer">
            <li className="zoomButton">
              <a id="zoom-in" data-zoom="+1">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">add</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="zoom-out" data-zoom="-1">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">remove</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
            <li className="zoomButton">
              <a id="reset" data-zoom="-8">
                <FloatingActionButton mini={true}>
                  <FontIcon className="material-icons">settings_backup_restore</FontIcon>
                </FloatingActionButton>
              </a>
            </li>
          </ul>
        </div>
      </div>
		);
	}
});

export default GMDendrogramChart
