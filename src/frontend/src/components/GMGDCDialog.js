import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import TextField from 'material-ui/lib/text-field'
import ListItem from 'material-ui/lib/lists/list-item'
import FontIcon from 'material-ui/lib/font-icon'
import RaisedButton from 'material-ui/lib/raised-button'
import RadioButtonGroup from 'material-ui/lib/raised-button'
import RadioButton from 'material-ui/lib/radio-button'

import config from '../../config'

const errorText = 'This is a required field'

const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    marginBottom: 16,
  },
  RadioButtonGroup:{
    maxWidth: 100,
    maxLength: 100
  }
};

class GMGDCDialog extends Component {
  initialState () {
    return {
      open: false,
      projectValue: '',
      projectName: '',
      disease: {disease_type:'', datatype: 'FPKM'},
      showAdvancedOptions: false,
      gdcweb: 'https://gdc-portal.nci.nih.gov/projects/t'
    }
  }

  constructor (props, context) {
    super(props, context)
    this.state = this.initialState()
  }

  validateForm () {
    return this.state.projectValue === 'new' ?
      (!!this.state.projectName) : // New projects only require a name
      (this.state.projectValue)
  }

  handleSubmit () {
    this.props.submit(document.forms.importDatabase)
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
                     optionDisabled: true
      })
    }
  }

  onChangeProjectName (event) {
    this.setState({projectName: event.target.value})
  }

  onChangeDisasterType(event, index, value){
    this.setState({disease: {disease_type: value, datatype: this.state.disease.datatype},
                   gdcweb: "https://gdc-portal.nci.nih.gov/projects/"+this.state.disease.disease_type
                 })
  }

  handleShowAdvancedOptions(event) {
    this.setState({showAdvancedOptions: !this.state.showAdvancedOptions})
  }

  setDataTypeGen(event) {
    this.setState({disease: {disease_type: this.state.disease.disease_type, datatype: 'FPKM'}})
  }

  setDataTypeRNA(event) {
    this.setState({disease: {disease_type: this.state.disease.disease_type, datatype: 'FPKMUQ'}})
  }

  setDataTypemiRNA(event) {
    this.setState({disease: {disease_type: this.state.disease.disease_type, datatype: 'htseq'}})
  }

  projectSearching(){
    var matches = []
    var request = require('request')
    var options = {
        url: 'https://gdc-api.nci.nih.gov/projects?fields=project_id,disease_type&from=1&size=65535&sort=project.project_id:asc&pretty=true'
    }
    request(options, function(error, response, body){
      if (!error && response.statusCode == 200) {
          var regpro = /\"project_id\": \"(.+?)\"/ig
          var regdis = /\"disease_type\": \"(.+?)\"/ig
          var foundpro, founddis
          while (foundpro = regpro.exec(body)) {
              founddis = regdis.exec(body)
              // matches.push(foundpro[0].split('"')[3]+'('+founddis[0].split('"')[3]+')')
              matches.push({
                  key: founddis[0].split('"')[3],
                  value: foundpro[0].split('"')[3]
              })
              regpro.lastIndex -= foundpro[0].split(':')[1].length
              regdis.lastIndex -= founddis[0].split(':')[1].length
          }
        }
      })
      return matches
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
    var DiseaseCases = [
      { key: 'Adrenocortical Carcinoma', value: 'TCGA-ACC' },
      { key: 'Bladder Urothelial Carcinoma', value: 'TCGA-BLCA' },
      { key: 'Breast Invasive Carcinoma', value: 'TCGA-BRCA' },
      { key: 'Cervical Squamous Cell Carcinoma and Endocervical Adenocarcinoma', value: 'TCGA-CESC' },
      { key: 'Cholangiocarcinoma', value: 'TCGA-CHOL' },
      { key: 'Colon Adenocarcinoma', value: 'TCGA-COAD' },
      { key: 'Lymphoid Neoplasm Diffuse Large B-cell Lymphoma', value: 'TCGA-DLBC' },
      { key: 'Esophageal Carcinoma', value: 'TCGA-ESCA' },
      { key: 'Glioblastoma Multiforme', value: 'TCGA-GBM' },
      { key: 'Head and Neck Squamous Cell Carcinoma', value: 'TCGA-HNSC' },
      { key: 'Kidney Chromophobe', value: 'TCGA-KICH' },
      { key: 'Kidney Renal Clear Cell Carcinoma', value: 'TCGA-KIRC' },
      { key: 'Kidney Renal Papillary Cell Carcinoma', value: 'TCGA-KIRP' },
      { key: 'Acute Myeloid Leukemia', value: 'TCGA-LAML' },
      { key: 'Brain Lower Grade Glioma', value: 'TCGA-LGG' },
      { key: 'Liver Hepatocellular Carcinoma', value: 'TCGA-LIHC' },
      { key: 'Lung Adenocarcinoma', value: 'TCGA-LUAD' },
      { key: 'Lung Squamous Cell Carcinoma', value: 'TCGA-LUSC' },
      { key: 'Mesothelioma', value: 'TCGA-MESO' },
      { key: 'Ovarian Serous Cystadenocarcinoma', value: 'TCGA-OV' },
      { key: 'Pancreatic Adenocarcinoma', value: 'TCGA-PAAD' },
      { key: 'Pheochromocytoma and Paraganglioma',value: 'TCGA-PCPG' },
      { key: 'Prostate Adenocarcinoma', value: 'TCGA-PRAD' },
      { key: 'Rectum Adenocarcinoma', value: 'TCGA-READ' },
      { key: 'Sarcoma', value: 'TCGA-SARC' },
      { key: 'Skin Cutaneous Melanoma', value: 'TCGA-SKCM' },
      { key: 'Stomach Adenocarcinoma', value: 'TCGA-STAD' },
      { key: 'Uveal Melanoma', value: 'TCGA-UVM' },
      { key: 'Uterine Carcinosarcoma', value: 'TCGA-UCS' },
      { key: 'Thyroid Carcinoma', value: 'TCGA-THCA' },
      { key: 'Uterine Corpus Endometrial Carcinoma', value: 'TCGA-UCEC' },
      { key: 'Testicular Germ Cell Tumors', value: 'TCGA-TGCT' },
      { key: 'Thymoma', value: 'TCGA-THYM' }
    ]

    var DiseaseList = DiseaseCases.map((obj , i) =>
      <MenuItem key={i} value={obj.value} primaryText={obj.key} />
    )
    var DiseaseReact = DiseaseCases.map((obj , i) =>
      <option key={i} value={obj.value}> {obj.key} </option>
    )
    return (
      <div>
        <ListItem
          primaryText='Import GDC Data'
          onClick={this.handleOpen.bind(this)}
          leftIcon={<FontIcon className='material-icons'>add</FontIcon>}
        />
        <Dialog
          autoScrollBodyContent={true}
          className='gm-dialog__importGDC'
          title='Import GDC Data'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
        <form name='importDatabase'>

          <div id='leftHalfDiv' style={{width:'65%', float:'left'}}>
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
            <SelectField style={{width: '80%'}}
                value={this.state.disease.disease_type}
                hintText='Disease Type'
                errorText={!this.state.disease.disease_type && errorText}
                onChange={this.onChangeDisasterType.bind(this)}
                >
                {DiseaseList}
            </SelectField>
            <select
                id = 'disease_type'
                className = 'hidden'
                value ={this.state.disease.disease_type}
                readOnly
                >
                {DiseaseReact}
            </select>
            <br />
            {console.log(this.state.gdcweb)}
            <a href = {this.state.gdcweb} target="_blank">
            <img src="images/GDCLOGO.ico" style={{width:"50%"}}/></a>
          </div>

          <div id='rightHalfDiv' style={{width:'35%', float:'right'}}>
            <div>
              <FlatButton label='Advanced Options' secondary={true} onClick={this.handleShowAdvancedOptions.bind(this)} />
            </div>
            <br / >
            {(this.state.showAdvancedOptions) ?
            <div id='advancedOptionsDiv' style= {{width:'80%', height:'80%', float:'bottom'}}>
              <span>Data Type</span>
              <br/>
              <div>
                <RadioButtonGroup
                  name="dataType"
                  id="dataType"
                  defaultSelected="FPKM"
                  value = {this.state.disease.datatype}
                  style={{width:'80%', height:'80%', float:'bottom'}}
                >
                  <RadioButton
                    value = "FPKM"
                    onClick={this.setDataTypeGen.bind(this)}
                    style={styles.radioButton}
                    label="FPKM" checked={this.state.disease.datatype === 'FPKM'}
                  />
                  <RadioButton
                    value = "FPKMUQ"
                    onClick={this.setDataTypeRNA.bind(this)}
                    style={styles.radioButton}
                    label ="FPKM-UQ" checked={this.state.disease.datatype === 'FPKMUQ'}
                  />
                  <RadioButton
                    value = "htseq"
                    onClick={this.setDataTypemiRNA.bind(this)}
                    style={styles.radioButton}
                    label="htseq" checked={this.state.disease.datatype === 'htseq'}
                  />
                </RadioButtonGroup>
              </div>
            </div>
              : null
            }
          </div>
        </form>
        </Dialog>
      </div>
    )
  }
}

GMGDCDialog.propTypes = {
  projects: PropTypes.array.isRequired
}

export default GMGDCDialog
