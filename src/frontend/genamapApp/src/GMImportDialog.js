var React = require('react');
var Dialog = require('material-ui/lib/dialog');
var FlatButton = require('material-ui/lib/flat-button');
var RaisedButton = require('material-ui/lib/raised-button');
var SelectField = require('material-ui/lib/select-field');
var MenuItem = require('material-ui/lib/menus/menu-item');
var TextField = require('material-ui/lib/text-field');
var ListItem = require('material-ui/lib/lists/list-item');
var FontIcon = require('material-ui/lib/font-icon');

var GetRequest = require('./Requests').GetRequest;

var styles = {
  fileInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  fileInputButton: {
    marginRight: '7px',
  },
};

var errorText = "This is a required field"


var GMImportDialog = React.createClass({
  getInitialState: function () {
    return {
              open: false, 
              projects: [], 
              species: [], 
              projectValue: "", 
              projectName: "",
              markerName: "",
              markerFileName: "",
              traitName: "",
              traitFileName: "",
              speciesValue: "",
              optionDisabled: true,
            };
  },
  componentDidMount: function () {
    this.loadData();
  },
  loadData: function () {
    GetRequest(this.props.projectUrl, {}, (projects) => {
      this.setState({projects: projects});
    });
    GetRequest(this.props.speciesUrl, {}, (species) => {
      this.setState({species: species});
    });
  },
  validateForm: function () {
    return ((!!this.state.projectValue && this.state.projectValue != "new" || 
            (this.state.projectValue == "new" && !!this.state.projectName && 
            !!this.state.speciesValue)) &&
            !!this.state.markerName && !!this.state.markerFileName &&
            !!this.state.traitName && !!this.state.traitFileName)
  },
  handleSubmit: function () {
    this.props.submit(document.forms.importData);
    this.setState(this.getInitialState());
    this.handleClose();
  },
  handleOpen: function () {
    this.loadData();
    this.setState({open: true});
  },
  handleClose: function () {
    this.setState({open: false});
  },
  onChangeProject: function (event, index, value) {
    if (value == "new") {
      this.setState({projectValue: value,
                     optionDisabled: false
      });

    } else {
      var existingProject = this.state.projects.find(function (project, index, array) {
        return project.id === value;
      });
      var species = existingProject.species;
      var projectName = existingProject.name;
      this.setState({projectValue: value,
                     projectName: projectName,
                     speciesValue: species,
                     optionDisabled: true
      });
    }
  },
  onChangeProjectName: function (event) {
    this.setState({projectName: event.target.value});
  },
  onChangeMarkerName: function (event) {
    this.setState({markerName: event.target.value});
  },
  onChangeMarkerFileName: function (event) {
    this.setState({markerFileName: event.target.value.substr(12)});
  },
  onChangeTraitName: function (event) {
    this.setState({traitName: event.target.value});
  },
  onChangeTraitFileName: function (event) {
    this.setState({traitFileName: event.target.value.substr(12)});
  },
  onChangeSpecies: function (event, index, value) {
    this.setState({speciesValue: value});
  },
  render: function() {
    var actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Import"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit}
        disabled={!this.validateForm()}
      />,
    ];
    var projectList = this.state.projects.map(function (project) {
      return (
        <MenuItem key={project.id} value={project.id} 
                  primaryText={project.name} />
      );
    });
    var projectListReact = this.state.projects.map(function (project) {
      return (
        <option key={project.id} value={project.id}>{project.name}</option>
      );
    });
    var speciesList = this.state.species.map(function (species) {
      return (
        <MenuItem key={species.id} value={species.name} 
                  primaryText={species.name} />
      );
    }); 
    var speciesListReact = this.state.species.map(function (species) {
      return (
        <option key={species.id} value={species.name}>{species.name}</option>
      );
    }); 
    return (
      <div>
        <ListItem primaryText="Import Data" onClick={this.handleOpen}
                  leftIcon={<FontIcon className="material-icons">add</FontIcon>} />
        <Dialog className="gm-dialog__import"
                title="Import Data"
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}>
          <form name="importData">
            <div>
              <SelectField  
                           value={this.state.projectValue} 
                           hintText="Choose Project"
                           errorText={!this.state.projectValue && errorText}
                           onChange={this.onChangeProject}>
                <MenuItem value={"new"} primaryText="New Project" />
                {projectList}
              </SelectField>
              <select id="project" className="hidden" value={this.state.projectValue} readOnly>
                <option value="new">New Project</option>
                {projectListReact}
              </select>
              <br/>
              <TextField id="projectName"
                         value={this.state.projectName}
                         hintText="New Project Name"
                         disabled={this.state.optionDisabled}
                         errorText={!this.state.projectName && !this.state.optionDisabled && errorText}
                         onChange={this.onChangeProjectName} />
            </div>
            <div>
              <TextField id="markerName"
                         value={this.state.markerName}
                         hintText="Marker Name" 
                         errorText={!this.state.markerName && errorText} 
                         onChange={this.onChangeMarkerName} />
              <br/>
              <div className="file-field-wrapper">
                <RaisedButton label="Marker File" secondary={true} 
                              style={styles.fileInputButton}>
                  <input id="markerFile" type="file" accept=".csv" 
                         style={styles.fileInput} 
                         onChange={this.onChangeMarkerFileName} />
                </RaisedButton>
                <TextField id="markerFileName"
                           value={this.state.markerFileName}
                           disabled={true} />
              </div>
            </div>
            <br/>
            <div>
              <TextField id="traitName"
                         value={this.state.traitName}
                         hintText="Trait Name"
                         errorText={!this.state.traitName && errorText} 
                         onChange={this.onChangeTraitName} />
              <div className="file-field-wrapper">
                <RaisedButton label="Trait File" secondary={true} 
                              style={styles.fileInputButton}>
                  <input id="traitFile" type="file" accept=".csv" 
                         style={styles.fileInput} 
                         onChange={this.onChangeTraitFileName} />
                </RaisedButton>
                <TextField id="traitFileName"
                           value={this.state.traitFileName}
                           disabled={true} />
              </div>
            </div>
            <div>
              <SelectField 
                           value={this.state.speciesValue}
                           disabled={this.state.optionDisabled}
                           hintText="Choose Species"
                           errorText={!this.state.speciesValue && !this.state.optionDisabled && errorText}
                           onChange={this.onChangeSpecies}>
                <MenuItem value="none" primaryText="None" />
                {speciesList}
              </SelectField>
              <select id="species" className="hidden" value={this.state.speciesValue} readOnly>
                <option value="none">None</option>
                {speciesListReact}
              </select>
            </div>
          </form>
        </Dialog>
      </div>
    )
  }
});

module.exports = GMImportDialog;