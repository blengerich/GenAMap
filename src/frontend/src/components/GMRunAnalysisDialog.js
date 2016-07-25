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
      // Files
      open: false,
      projects: [],
      markers: [],
      traits: [],
      markerLabels: [],
      traitLabels: [],
      jobName: '',
      projectValue: '',
      markerValue: '',
      traitValue: '',
      markerLabelValue: '',
      traitLabelValue: '',
      resultsPath: '',
      // Model parameters
      models: config.models,
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
      // Algorithm parameters
      algorithms: config.algorithms,
      algorithmsByModelList : Object.keys(config.algorithmsByModel).map((value, index) =>
        config.algorithmsByModel[value].map((algorithm, index) => 
          <MenuItem key={index} value={algorithm.id} primaryText={algorithm.name} />)),
      availableAlgorithmList: [],
      algorithmValue: '',
      learning_rate: 0.001,
      learning_rate2: 0.001,
      tolerance: 0.000001,
      lambda_start_point: 0.0,  // TODO: how to set good defaults for these?
      lambda_end_point: 0.0,
      lambda_interval: 0.0,
      a: 0.0,
      b: 0.0,
      c: 0.0,
      m: 0.0,
      e: 0.0,
      t: 0.0,
      delta: 0.0
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      open: nextProps.open,
      projects: nextProps.projects
    })
  },
  validateForm: function () {
    return (!!this.state.jobName && !!this.state.projectValue &&
            !!this.state.markerValue && !!this.state.traitValue &&
            this.state.modelValue !== '')
  },
  handleSubmit: function () {
    this.props.submit({
      project: this.state.projectValue,
      jobName: this.state.jobName,
      marker: this.state.markerValue,
      trait: this.state.traitValue,
      algorithmOptions: {
        type: this.state.algorithmValue,
        options: {
          learning_rate: this.state.learning_rate,
          learning_rate2: this.state.learning_rate2,
          tolerance: this.state.tolerance,
          lambda_start_point: this.state.lambda_start_point,
          lambda_end_point: this.state.lambda_end_point,
          lambda_interval: this.state.lambda_interval,
          a: this.state.a,
          b: this.state.b,
          c: this.state.c,
          m: this.state.m,
          e: this.state.e,
          t: this.state.t,
          delta: this.state.delta
        }
      },
      modelOptions: {
        type: this.state.modelValue,
        options: {
          lambda: this.state.lambda,
          L2_lambda: this.state.lambdal2,
          mu: this.state.mu,
          gamma: this.state.gamma,
          threshold: this.state.threshold,
          clusteringMethod: this.state.clusteringMethod
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
    const markers = project.markers
    const traits = project.traits

    this.setState({
      projectValue: value,
      markers: markers,
      markerValue: '',
      traits: traits,
      traitValue: ''
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
  onChangeModel: function (event, index, value) {
    this.setState({modelValue: value,
                  showAdvancedOptionsButton: true,
                  availableAlgorithmList: this.state.algorithmsByModelList[value]},
                  function() { // always use the algorithm listed first as the default
                    this.setState({algorithmValue: this.state.availableAlgorithmList["0"].props.value})
                  }.bind(this)) 
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
  onChangeAlgorithm: function(event, index, value) {
    this.setState({algorithmValue: value})
  },
  onChangeA: function(event) {
    this.setState({a: event.target.value})
  },
  onChangeB: function(event) {
    this.setState({b: event.target.value})
  },
  onChangeC: function(event) {
    this.setState({c: event.target.value})
  },
  onChangeM: function(event) {
    this.setState({m: event.target.value})
  },
  onChangeE: function(event) {
    this.setState({e: event.target.value})
  },
  onChangeT: function(event) {
    this.setState({t: event.target.value})
  },
  onChangeDelta: function(event) {
    this.setState({delta: event.target.value})
  },
  onChangeLearningRate: function(event) {
    this.setState({learning_rate: event.target.value})
  },
  onChangeLearningRate2: function(event) {
    this.setState({learning_rate2: event.target.value})
  },
  onChangeTolerance: function(event) {
    this.setState({tolerance: event.target.value})
  },
  onChangeLambdaStartPoint: function(event) {
    this.setState({lambda_start_point: event.target.value})
  },
  onChangeLambdaEndPoint: function(event) {
    this.setState({lambda_end_point: event.target.value})
  },
  onChangeLambdaInterval: function(event) {
    this.setState({lambda_interval: event.target.value})
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
      <MenuItem key={index} value={marker} primaryText={marker.name} />
    )
    const markerListReact = this.state.markers.map((marker, index) =>
      <option key={index} value={marker}>{marker.name}</option>
    )
    const traitList = this.state.traits.map((trait, index) =>
      <MenuItem key={index} value={trait} primaryText={trait.name} />
    )
    const traitListReact = this.state.traits.map((trait, index) =>
      <option key={index} value={trait}>{trait.name}</option>
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
    const algorithmListReact = this.state.algorithms.map((algorithm, index) =>
      <option key={index} value={algorithm.id}>{algorithm.name}</option>
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
            <div style={{width:'45%', float:'left'}}>
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
            </div>
            <div style={{width:'45%', float:'right'}}>
              <div>
                <SelectField
                  value={this.state.modelValue}
                  hintText='Choose Model Type'
                  errorText={this.state.modelValue === '' && errorText}
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
              {(this.state.showAdvancedOptions) ?
                <div id='advancedOptionsDiv'>
                  {(this.state.modelValue == 0) ?
                    <div><div>L1 Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                     <div>L2 Lambda: <input type="number" value={this.state.lambdal2} onChange={this.onChangeLambdaL2}/></div><br/>
                    </div> : 
                  (this.state.modelValue == 1) ? 
                    <div><p>Lasso.cpp not implemented?</p></div> :
                  (this.state.modelValue == 2) ? 
                    <div><div>L1 Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                         <div>L2 Lambda: <input type="number" value={this.state.lambdal2} onChange={this.onChangeLambdaL2}/></div><br/>
                         <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div>
                    </div> :
                  (this.state.modelValue == 3) ?
                    <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                         <div>Gamma: <input type="number" value={this.state.gamma} onChange={this.onChangeGamma}/></div>
                    </div>  :
                  (this.state.modelValue == 4) ? 
                    <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                         <div>Gamma: <input type="number" value={this.state.gamma} onChange={this.onChangeGamma}/></div><br/>
                         <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div>
                    </div>  :
                  (this.state.modelValue == 5) ? 
                    <div><div>Lambda: <input type="number" value={this.state.lambda} onChange={this.onChangeLambda}/></div><br/>
                      <div>Mu: <input type="number" value={this.state.mu} onChange={this.onChangeMu}/></div><br/>
                      <div>Threshold: <input type="number" value={this.state.threshold} onChange={this.onChangeThreshold}/></div>
                      <div>Clustering Method:  
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
                    </div>
                  : null}
                  <div> 
                    <SelectField
                      value={this.state.algorithmValue}
                      hintText='Choose Algorithm Type'
                      errorText={this.state.algorithmValue == '' && errorText}
                      onChange={this.onChangeAlgorithm}
                    >
                    {this.state.availableAlgorithmList}
                    </SelectField>
                    <select id='algorithmValue' className='hidden' value={this.state.algorithmValue} readOnly>
                      {algorithmListReact}
                    </select>
                  </div>
                  <div id='algorithmOptionsDiv'>
                    {(this.state.algorithmValue == 0) ? // Brent Search
                      <div>
                        <div>Search Start: <input type="number" value={this.state.a} onChange={this.onChangeA}/></div><br/>
                        <div>Search End: <input type="number" value={this.state.b} onChange={this.onChangeB}/></div><br/>
                        <div>Estimate: <input type="number" value={this.state.c} onChange={this.onChangeC}/></div><br/>
                        <div>Positive tolerance: <input type="number" value={this.state.m} onChange={this.onChangeM}/></div><br/>
                        <div>Positive tolerance error: <input type="number" value={this.state.e} onChange={this.onChangeE}/></div><br/>
                        <div>t: <input type="number" value={this.state.t} onChange={this.onChangeT}/></div><br/>
                        <div>Delta: <input type="number" value={this.state.delta} onChange={this.onChangeDelta}/></div>
                      </div> : 
                    (this.state.algorithmValue == 1) ? // Proximal Gradient Descent
                      <div>
                        <div>Learning Rate: <input type="number" value={this.state.learning_rate} onChange={this.onChangeLearningRate}/></div><br/>
                        <div>Inner Learning Rate: <input type="number" value={this.state.learning_rate2} onChange={this.onChangeLearningRate2}/></div><br/>
                        <div>Tolerance: <input type="number" value={this.state.tolerance} onChange={this.onChangeTolerance}/></div>
                      </div> :
                    (this.state.algorithmValue == 2) ? // Grid Search
                      <div>
                        <div>Start: <input type="number" value={this.state.lambda_start_point} onChange={this.onChangeLambdaStartPoint}/></div><br/>
                        <div>End: <input type="number" value={this.state.lambda_end_point} onChange={this.onChangeLambdaEndPoint}/></div><br/>
                        <div>Interval: <input type="number" value={this.state.lambda_interval} onChange={this.onChangeLambdaInterval}/></div>
                      </div> :
                    (this.state.algorithmValue == 3) ? // Iterative Update
                      <div>
                        <div>Tolerance: <input type="number" value={this.state.tolerance} onChange={this.onChangeTolerance}/></div>
                      </div> :
                    null}
                  </div>
                </div>:
                null
              }
            </div>
          </form>
        </Dialog>
      </div>
    )
  }
})

export default GMRunAnalysisDialog
