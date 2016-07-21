import React from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import TextField from 'material-ui/lib/text-field'

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
      markerLabels: [],
      traitLabels: [],
      algorithms: config.algorithms,
      models: config.models,
      jobName: '',
      projectValue: '',
      markerValue: '',
      traitValue: '',
      markerLabelValue: '',
      traitLabelValue: '',
      algorithmValue: '',
      algorithmOptions: {type: 2, options: {tolerance: 0.01, learning_rate: 0.01}}, //TODO: implement algorithmOptions in GUI
      modelValue: '',
      lambda: 0.0,
      lambdal2: 0.0,
      mu: 0.0,
      gamma: 0.0,
      threshold: 0.0,
      clusteringMethods: ['average', 'single', 'complete'],
      clusteringMethod: 'single',
      showAdvancedOptionsButton: false,
      showAdvancedOptions: false,
      resultsPath: ''
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open,
      projects: nextProps.projects
    })
  },
  validateForm: function () {
    return (!!this.state.jobName &&
            !!this.state.projectValue && !!this.state.markerValue &&
            !!this.state.traitValue && !!this.state.markerLabelValue &&
            !!this.state.traitLabelValue && !!this.state.modelValue)
  },
  handleSubmit: function () {
    this.props.submit({
      project: this.state.projectValue,
      jobName: this.state.jobName,
      marker: this.state.markerValue,
      trait: this.state.traitValue,
      markerLabel: this.state.markerLabelValue,
      traitLabel: this.state.traitLabelValue,
      algorithmOptions: this.state.algorithmOptions,
      modelOptions: {
        type: this.state.modelValue,
        options: {
          lambda: this.state.lambda,
          L2_lambda: this.state.lambdal2,
          mu: this.state.mu,
          gamma: this.state.gamma,
          threshold: this.state.threshold,
          clusteringMethod: this.state.clusteringMethods
        }
      },
      resultsPath: this.state.resultsPath
    })
    this.setState(this.getInitialState())
    this.handleClose()
  },
  handleClose: function () {
    this.props.onClose()
  },
  handleShowAdvancedOptions: function() {
    this.setState({showAdvancedOptions: !this.state.showAdvancedOptions})
  },
  onChangeProject: function (event, index, value) {
    const project = this.props.projects[index]
    const markers = project.files.filter(file => file.filetype === 'markerFile')
    const traits = project.files.filter(file => file.filetype === 'traitFile')
    const markerLabels = project.files.filter(file => file.filetype === 'markerLabelFile')
    const traitLabels = project.files.filter(file => file.filetype === 'traitLabelFile')

    this.setState({
      projectValue: value,
      markers: markers,
      markerValue: '',
      traits: traits,
      traitValue: '',
      markerLabels: markerLabels,
      markerLabelValue: '',
      traitLabels: traitLabels,
      traitLabelValue: ''
    })
  },
  onChangeJobName: function (event) {
    this.setState({jobName: event.target.value})
  },
  onChangeMarker: function (event, index, value) {
    this.setState({markerValue: value})
  },
  onChangeTrait: function (event, index, value) {
    this.setState({traitValue: value})
  },
  onChangeMarkerLabel: function(event, index, value) {
    this.setState({markerLabelValue: value})
  },
  onChangeTraitLabel: function(event, index, value) {
    this.setState({traitLabelValue: value})
  },
  onChangeModel: function (event, index, value) {
    this.setState({modelValue: value,
                  showAdvancedOptionsButton: true})
  },
  onChangeLambda: function(event) {
    this.setState({lambda : event.target.value})
  },
  onChangeLambdaL2: function(event) {
    this.setState({lambdal2: event.target.value})
  },
  onChangeGamma: function(event) {
    this.setState({gamma: event.target.value})
  },
  onChangeMu: function(event) {
    this.setState({mu: event.target.value})
  },
  onChangeThreshold: function(event) {
    this.setState({threshold: event.target.value})
  },
  onChangeClusteringMethod: function(event, index, value) {
    this.setState({clusteringMethod: value})
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
    const markerLabelList = this.state.markerLabels.map((markerLabel, index) =>
      <MenuItem key={index} value={markerLabel.id} primaryText={markerLabel.name} />
    )
    const markerLabelListReact = this.state.markerLabels.map((markerLabel, index) =>
      <option key={index} value={markerLabel.id}>{markerLabel.name}</option>
    )
    const traitLabelList = this.state.traitLabels.map((traitLabel, index) =>
      <MenuItem key={index} value={traitLabel.id} primaryText={traitLabel.name} />
    )
    const traitLabelListReact = this.state.traitLabels.map((traitLabel, index) =>
      <option key={index} value={traitLabel.id}>{traitLabel.name}</option>
    )
    const modelList = this.state.models.map((model, index) =>
      <MenuItem key={index} value={model.id} primaryText={model.name} />
    )
    const modelListReact = this.state.models.map((model, index) =>
      <option key={index} value={model.id}>{model.name}</option>
    )
    const clusteringMethodList = this.state.clusteringMethods.map((method, index) =>
      <MenuItem key={index} value={method} primaryText={method} />
    )
    const clusteringMethodListReact = this.state.clusteringMethods.map((method, index) =>
      <option key={index} value={method}>{method}</option>
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
              <TextField
                value={this.state.jobName}
                hintText='Choose Job Name'
                errorText={!this.state.jobName && errorText}
                onChange={this.onChangeJobName}
              />
            </div>
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
            <div>
              <SelectField
                value={this.state.markerLabelValue}
                hintText='Choose Marker Labels'
                errorText={!this.state.markerLabelValue && errorText}
                onChange={this.onChangeMarkerLabel}
              >
                {markerLabelList}
              </SelectField>
              <select id='markerLabel' className='hidden' value={this.state.markerLabelValue} readOnly>
                {markerLabelListReact}
              </select>
            </div>
            <div>
              <SelectField
                value={this.state.traitLabelValue}
                hintText='Choose Trait Labels'
                errorText={!this.state.traitLabelValue && errorText}
                onChange={this.onChangeTraitLabel}
              >
                {traitLabelList}
              </SelectField>
              <select id='traitLabel' className='hidden' value={this.state.traitLabelValue} readOnly>
                {traitLabelListReact}
              </select>
            </div>
            <div>
              <SelectField
                value={this.state.modelValue}
                hintText='Choose Model'
                errorText={!this.state.modelValue && errorText}
                onChange={this.onChangeModel}
              >
              {modelList}
              </SelectField>
              {(!!this.state.showAdvancedOptionsButton) ?
                <FlatButton label='Show Advanced Options' secondary={true} onClick={this.handleShowAdvancedOptions} />
                : null
              }
              <select id='model' className='hidden' value={this.state.modelValue} readOnly>
                {modelListReact}
              </select>
            </div>
            <div>
              {(this.state.showAdvancedOptions) ?
                ((this.state.modelValue == 1) ?
                  <div><div>L1 Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                       <div>L2 Lambda: <input type="number" value={this.state.lambdal2} onChange={this.onChangeLambdaL2}/></div>
                  </div> :
                (this.state.modelValue == 2) ?
                  <div><p>Lasso.cpp not implemented?</p></div> :
                (this.state.modelValue == 3) ?
                  <div><div>L1 Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                       <div>L2 Lambda: <input type="number" value={this.state.lambdal2} onChange={this.onChangeLambdaL2}/></div><br/>
                       <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div>
                  </div> :
                (this.state.modelValue == 4) ?
                  <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                       <div>Gamma: <input type="number" value={this.state.gamma} onChange={this.onChangeGamma}/></div>
                  </div>  :
                (this.state.modelValue == 5) ?
                  <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                       <div>Gamma: <input type="number" value={this.state.gamma} onChange={this.onChangeGamma}/></div><br/>
                       <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div>
                  </div>  :
                (this.state.modelValue == 6) ?
                  <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                       <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div><br/>
                       <div>Threshold: <input type="number" value={this.state.threshold} onChange={this.onChangeThreshold}/></div>
                       <div>
                        Clustering Method:
                        <SelectField
                          value={this.state.clusteringMethod}
                          hintText='Clustering Method'
                          errorText={!this.state.clusteringMethod && errorText}
                          onChange={this.onChangeClusteringMethod}
                        >
                        {clusteringMethodList}
                        </SelectField>
                        <select id='clusteringMethod' className='hidden' value={this.state.clusteringMethod} readOnly>
                          {clusteringMethodListReact}
                        </select>
                      </div>
                  </div>:
                null) : null}
            </div>
          </form>
        </Dialog>
      </div>
    )
  }
})

export default GMRunAnalysisDialog
