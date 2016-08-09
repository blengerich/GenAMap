import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import TextField from 'material-ui/lib/text-field'
import ListItem from 'material-ui/lib/lists/list-item'
import FontIcon from 'material-ui/lib/font-icon'

import config from '../../config'
import GMFileInput from './GMFileInput'

const errorText = 'This is a required field'

class GMImportDialog extends Component {
  initialState () {
    return {
      open: false,
      projectValue: '',
      projectName: '',
      speciesValue: '',
      markerLabelFileName: '',
      markerName: '',
      markerFileName: '',
      traitLabelFileName: '',
      traitName: '',
      traitFileName: '',
      snpsFeatureFileName: '',
      snpsFeatureName: '',
      populationFileName: '',
      populationName: '',
      optionDisabled: true,
      species: config.species
    }
  }

  constructor (props, context) {
    super(props, context)
    this.state = this.initialState()
  }

  validateForm () {
    return this.state.projectValue === 'new' ?
      (!!this.state.projectName && !!this.state.speciesValue) : // New projects only require a name and a species
      (!!this.state.projectValue && // If we are using an existing project, we can add markers and/or traits
        (!!this.state.markerName && !!this.state.markerFileName && !!this.state.markerLabelFileName) ||
        (!!this.state.traitName && !!this.state.traitFileName && !!this.state.traitLabelFileName) ||
        (!!this.state.snpsFeatureName && !!this.state.snpsFeatureFileName) ||
        (!!this.state.populationName && !!this.state.populationFileName))
  }

  handleSubmit () {
    this.props.submit(document.forms.importData)
    this.setState(this.initialState())
    this.handleClose()
  }

  handleOpen () {
    this.setState({open: true})
  }

  handleClose () {
    this.setState({open: false})
  }

  onChangeProject (event, index, value) {
    if (value === 'new') {
      this.setState({projectValue: value,
                     optionDisabled: false
      })
    } else {
      const existingProject = this.props.projects.find(function (project, index, array) {
        return (project.id === value)
      })
      const species = existingProject.species
      const projectName = existingProject.name
      this.setState({projectValue: value,
                     projectName: projectName,
                     speciesValue: species,
                     optionDisabled: true
      })
    }
  }

  onChangeProjectName (event) {
    this.setState({projectName: event.target.value})
  }

  onChangeSpecies (event, index, value) {
    this.setState({speciesValue: value})
  }

  onChangeMarkerLabelFileName (event) {
    this.setState({markerLabelFileName: event.target.value.substr(12)})
  }

  onChangeMarkerName (event) {
    this.setState({markerName: event.target.value})
  }

  onChangeMarkerFileName (event) {
    this.setState({markerFileName: event.target.value.substr(12)})
  }

  onChangeTraitLabelFileName(event) {
    this.setState({traitLabelFileName: event.target.value.substr(12)})
  }

  onChangeTraitName (event) {
    this.setState({traitName: event.target.value})
  }

  onChangeTraitFileName (event) {
    this.setState({traitFileName: event.target.value.substr(12)})
  }

  onChangeSnpsFeatureName (event) {
    this.setState({snpsFeatureName: event.target.value})
  }

  onChangeSnpsFeatureFileName (event) {
    this.setState({snpsFeatureFileName: event.target.value.substr(12)})
  }

  onChangePopulationName(event) {
    this.setState({populationName: event.target.value})
  }

  onChangePopulationFileName (event) {
    this.setState({populationFileName: event.target.value.substr(12)})
  }

  render () {
    var actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        label='Import'
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit.bind(this)}
        disabled={!this.validateForm()}
      />
    ]
    var projectList = this.props.projects.map((project, i) =>
      <MenuItem key={i} value={project.id} primaryText={project.name} />
    )
    var projectListReact = this.props.projects.map((project, i) =>
      <option key={i} value={project.id}>{project.name}</option>
    )
    var speciesList = this.state.species.map((species, i) =>
      <MenuItem key={i} value={species.name} primaryText={species.name} />
    )
    var speciesListReact = this.state.species.map((species, i) =>
      <option key={i} value={species.name}>{species.name}</option>
    )
    return (
      <div>
        <ListItem
          primaryText='Import Data'
          onClick={this.handleOpen.bind(this)}
          leftIcon={<FontIcon className='material-icons'>add</FontIcon>}
        />
        <Dialog
          autoScrollBodyContent={true}
          className='gm-dialog__import'
          title='Import Data'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          <form name='importData'>
            <div>
              <SelectField
                value={this.state.projectValue}
                hintText='Choose Project'
                errorText={!this.state.projectValue && errorText}
                onChange={this.onChangeProject.bind(this)}
              >
                <MenuItem value={'new'} primaryText='New Project' />
                {projectList}
              </SelectField>
              <select
                id='project'
                className='hidden'
                value={this.state.projectValue}
                readOnly
              >
                <option value='new'>New Project</option>
                {projectListReact}
              </select>
              <br />
              <TextField
                id='projectName'
                value={this.state.projectName}
                hintText='New Project Name'
                disabled={this.state.optionDisabled}
                errorText={!this.state.projectName && !this.state.optionDisabled && errorText}
                onChange={this.onChangeProjectName.bind(this)}
              />
            </div>
            <div>
              <SelectField
                value={this.state.speciesValue}
                disabled={this.state.optionDisabled}
                hintText='Choose Species'
                errorText={!this.state.speciesValue && !this.state.optionDisabled && errorText}
                onChange={this.onChangeSpecies.bind(this)}
              >
                {speciesList}
              </SelectField>
              <select
                id='species'
                className='hidden'
                value={this.state.speciesValue}
                readOnly
              >
                {speciesListReact}
              </select>
            </div>
            <div>
              <TextField
                id='markerName'
                value={this.state.markerName}
                hintText='Marker Name'
                errorText={(this.state.markerFileName || this.state.markerLabelFileName) && !this.state.markerName && errorText}
                onChange={this.onChangeMarkerName.bind(this)}
              />
              <br />
              <GMFileInput
                id='markerFile'
                buttonLabel='Marker File'
                accept='.csv'
                onChange={this.onChangeMarkerFileName.bind(this)}
                fileLabel={this.state.markerFileName}
              />
              <GMFileInput
                id='markerLabelFile'
                buttonLabel='Marker Label File'
                accept='.csv'
                onChange={this.onChangeMarkerLabelFileName.bind(this)}
                fileLabel={this.state.markerLabelFileName}
              />
            </div>
            <br />
            <div>
              <TextField
                id='traitName'
                value={this.state.traitName}
                hintText='Trait Name'
                errorText={(this.state.traitFileName || this.state.traitLabelFileName) && !this.state.traitName && errorText}
                onChange={this.onChangeTraitName.bind(this)}
              />
              <GMFileInput
                id='traitFile'
                buttonLabel='Trait File'
                accept='.csv'
                onChange={this.onChangeTraitFileName.bind(this)}
                fileLabel={this.state.traitFileName}
              />
              <GMFileInput
                id='traitLabelFile'
                buttonLabel='Trait Label File'
                accept='.csv'
                onChange={this.onChangeTraitLabelFileName.bind(this)}
                fileLabel={this.state.traitLabelFileName}
              />
            </div>
            <div id="populationDiv">
              <TextField
                id='population'
                value={this.state.populationName}
                hintText='Population File Name'
                errorText={this.state.populationFileName && !this.state.populationName && errorText}
                onChange={this.onChangePopulationName.bind(this)}
                importOnSubmit={true}
              />
              <GMFileInput
                id='populationFile'
                buttonLabel='Population File'
                accept='.csv'
                onChange={this.onChangePopulationFileName.bind(this)}
                fileLabel={this.state.populationFileName}
                importOnSubmit={true}
              />
            </div>
            <div id="snpFeaturesDiv">
              <TextField
                id='snpsFeature'
                value={this.state.snpsFeatureName}
                hintText='SNPs Features Name'
                errorText={this.state.snpsFeatureFileName && !this.state.snpsFeatureName && errorText}
                onChange={this.onChangeSnpsFeatureName.bind(this)}
                importOnSubmit={true}
              />
              <GMFileInput
                id='snpsFeatureFile'
                buttonLabel='SNPs Feature File'
                accept='.csv'
                onChange={this.onChangeSnpsFeatureFileName.bind(this)}
                fileLabel={this.state.snpsFeatureFileName}
                importOnSubmit={true}
              />
            </div>
          </form>
        </Dialog>
      </div>
    )
  }
}

GMImportDialog.propTypes = {
  projects: PropTypes.array.isRequired
}

export default GMImportDialog
