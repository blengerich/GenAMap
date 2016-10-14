import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import TextField from 'material-ui/lib/text-field'
import ListItem from 'material-ui/lib/lists/list-item'
import FontIcon from 'material-ui/lib/font-icon'
import router from 'react-router'
import { Link } from 'react-router'

import config from '../../config'

const errorText = 'This is a required field'
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

class GMManhattanDialog extends Component {
  initialState () {
    return {
      open: false,
      traitName: ''
    }
  }

  constructor (props, context) {
    super(props, context)
    this.state = this.initialState()
  }


  getDataUrl() {
    if(this.props.pageParams){
      var params = this.props.pageParams
      var link = params.marker.toString() + '/' + params.trait.toString() + '/' + params.result.toString() + '/' + this.state.traitName
      return '/visualization/manhattan/' + link
    }
  }

  validateForm () {
    return (Number.isInteger(this.state.traitName))
  }

  handleSubmit () {
    this.setState(this.initialState())
    this.handleClose()
  }

  handleOpen () {
    this.setState({open: true})
  }

  handleClose () {
    this.setState({open: false})
  }

  handleChangeTraitName(event, index, value){
    this.setState({traitName: value})
  }

  render () {
    var actions = [
      <FlatButton
        label='Cancel'
        secondary={true}
        onClick={this.handleClose.bind(this)}
        linkButton={true}
      />,
      <FlatButton
        label='View'
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit.bind(this)}
        disabled={!this.validateForm()}
        containerElement={<Link to={this.getDataUrl()}/>}
        linkButton={true}
      />
    ]
    if (this.props.traitLabels){
      var traitList = this.props.traitLabels.map((trait, i) =>
        <MenuItem key={i} value={i} primaryText={trait} />
      )
    }
    return (
      <div>
        <FlatButton
          label='Manhattan Visualization'
          style={styles.action}
          icon={<FontIcon className='material-icons'>equalizer</FontIcon>}
          onClick={this.handleOpen.bind(this)}
        />
        <Dialog
          title='Choose Trait for Manhattan View'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          <form name='ChooseTrait'>
            <div>
              <SelectField
                className='gm-dialog__import'
                hintText='Trait Name'
                value={this.state.traitName}
                onChange={this.handleChangeTraitName.bind(this)}
                >
                {traitList}
              </SelectField>

            </div>
          </form>
        </Dialog>
      </div>
    )
  }
}

export default GMManhattanDialog
