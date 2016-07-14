import React from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'

import GMAlgorithmCard from './GMAlgorithmCard'
import config from '../../config'

const styles = {
  checkbox: {
    marginBottom: 16
  },
  scroll: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: '-ms-autohiding-scrollbar',
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  scrollItem: {
    flex: '0 0 auto',
    maxWidth: '170px',
    marginRight: '10px'
  }
}

const errorText = 'This is a required field'

const GMRunAnalysisDialog = React.createClass({
  getInitialState: function () {
    return {
      open: false,
      projects: [],
      markers: [],
      traits: [],
      algorithms: config.algorithms,
      projectValue: '',
      markerValue: '',
      traitValue: '',
      algorithmsValue: new Set()
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open,
      projects: nextProps.projects
    })
  },
  validateForm: function () {
    return (!!this.state.projectValue && !!this.state.markerValue &&
            !!this.state.traitValue && this.state.algorithmsValue.size > 0)
  },
  handleSubmit: function () {
    this.props.submit({
      project: this.state.projectValue,
      marker: this.state.markerValue,
      trait: this.state.traitValue,
      algorithms: Array.from(this.state.algorithmsValue)
    })
    this.setState(this.getInitialState())
    this.handleClose()
  },
  handleClose: function () {
    this.props.onClose()
  },
  onChangeProject: function (event, index, value) {
    const project = this.props.projects[index]
    const markers = project.files.filter(file => file.filetype === 'markerFile')
    const traits = project.files.filter(file => file.filetype === 'traitFile')
    this.setState({
      projectValue: value,
      markers: markers,
      markerValue: '',
      traits: traits,
      traitValue: ''
    })
  },
  onChangeMarker: function (event, index, value) {
    this.setState({markerValue: value})
  },
  onChangeTrait: function (event, index, value) {
    this.setState({traitValue: value})
  },
  onChangeAlgorithm: function (algorithm) {
    var a = this.state.algorithmsValue;
    (a.has(algorithm.id)) ? a.delete(algorithm.id) : a.add(algorithm.id)
    this.setState({algorithmsValue: a})
  },
  /**
   * Test function to disable Tree Lasso since it is not currently implemented
   * @param {string} algorithmName
   * @return {Boolean}
   */
  isDisabled: function (algorithmName) {
    return algorithmName === 'Tree Lasso'
  },
  render: function () {
    const actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label='Run Analysis'
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit}
        disabled={!this.validateForm()}
      />
    ]
    const projectList = this.state.projects.map((project) =>
      <MenuItem key={project.id} value={project.id} primaryText={project.name} />
    )
    const projectListReact = this.state.projects.map((project) =>
      <option key={project.id} value={project.id}>{project.name}</option>
    )
    const markerList = this.state.markers.map((marker, index) =>
      <MenuItem key={index} value={marker.id} primaryText={marker.name} />
    )
    const markerListReact = this.state.markers.map((marker, index) =>
      <option key={index} value={marker.id}>{marker.name}</option>
    )
    const traitList = this.state.traits.map((trait, index) =>
      <MenuItem key={index} value={trait.id} primaryText={trait.name} />
    )
    const traitListReact = this.state.traits.map((trait, index) =>
      <option key={index} value={trait.id}>{trait.name}</option>
    )
    const algorithmList = this.state.algorithms.map(algorithm =>
      <GMAlgorithmCard
        key={algorithm.id}
        algorithm={algorithm}
        style={styles.scrollItem}
        disabled={this.isDisabled(algorithm.name)}
        handleChangeAlgorithm={this.onChangeAlgorithm}
      />
    )
    return (
      <div>
        <Dialog
          autoScrollBodyContent={true}
          className='gm-dialog__run-analysis'
          title='Run Analysis'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <form name='runAnalysis'>
            <div>
              <SelectField
                value={this.state.projectValue}
                hintText='Choose Project'
                errorText={!this.state.projectValue && errorText}
                onChange={this.onChangeProject}
              >
                {projectList}
              </SelectField>
              <select id='project' className='hidden' value={this.state.projectValue} readOnly>
                {projectListReact}
              </select>
            </div>
            <div>
              <SelectField
                value={this.state.markerValue}
                hintText='Choose Marker'
                errorText={!this.state.markerValue && errorText}
                onChange={this.onChangeMarker}
              >
                {markerList}
              </SelectField>
              <select id='marker' className='hidden' value={this.state.markerValue} readOnly>
                {markerListReact}
              </select>
            </div>
            <div>
              <SelectField
                value={this.state.traitValue}
                hintText='Choose Trait'
                errorText={!this.state.traitValue && errorText}
                onChange={this.onChangeTrait}
              >
                {traitList}
              </SelectField>
              <select id='trait' className='hidden' value={this.state.traitValue} readOnly>
                {traitListReact}
              </select>
            </div>
            <div style={styles.scroll}>
              {algorithmList}
            </div>
          </form>
        </Dialog>
      </div>
    )
  }
})

export default GMRunAnalysisDialog
