import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import Divider from 'material-ui/lib/divider'
import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import IconButton from 'material-ui/lib/icon-button'
import FontIcon from 'material-ui/lib/font-icon'
import AutoComplete from 'material-ui/lib/auto-complete'

import GMImportDialog from './GMImportDialog'

const GMProjectContent = React.createClass({
  getDataUrl: function() {
    switch (this.props.data.filetype) {
      case 'resultFile':
        const markerLabelFileId = this.props.data.labels.marker
        const traitLabelFileId = this.props.data.labels.trait

        return '/visualization/matrix/' + markerLabelFileId + '/' + traitLabelFileId + '/' + this.props.data.id
      default:
        return '/data/' + this.props.data.id
    }
  },
  getLeftIconName: function() {
    const filetype = this.props.data.filetype
    if (filetype === 'markerFile' || filetype === 'traitFile') {
      return 'assessment'
    } else if (filetype === 'resultFile') {
      return 'view_module'
    } else if (filetype === 'markerLabelFile' || filetype === 'traitLabelFile') {
      return 'label'
    } else {
      return ''
    }
  },
  iconButtonElement: function () {
    return (
      <IconButton touch={true}>
        <FontIcon className='material-icons'>more_vert</FontIcon>
      </IconButton>
    )
  },
  rightIconMenu: function () {
    const starMenuItem = (this.props.data.starred)
      ? <MenuItem
        primaryText={'Unstar ' + this.props.data.name}
        onTouchTap={this.handleStarFile}
        leftIcon={<FontIcon className='material-icons'>star</FontIcon>}
        disabled={true}
        />
      : <MenuItem
        primaryText={'Star ' + this.props.data.name}
        onTouchTap={this.handleStarFile}
        leftIcon={<FontIcon className='material-icons'>star_border</FontIcon>}
        disabled={true}
        />

    return (
      <IconMenu iconButtonElement={this.iconButtonElement()}>
        <MenuItem
          primaryText={'Download ' + this.props.data.name}
          onTouchTap={this.handleDownloadFile}
          leftIcon={<FontIcon className='material-icons'>file_download</FontIcon>}
        />
        <MenuItem
          primaryText={'Delete ' + this.props.data.name}
          onTouchTap={this.handleDeleteFile}
          leftIcon={<FontIcon className='material-icons'>delete</FontIcon>}
        />
        <MenuItem
          primaryText={'Rename ' + this.props.data.name}
          onTouchTap={this.handleRenameFile}
          leftIcon={<FontIcon className='material-icons'>mode_edit</FontIcon>}
          disabled={true}
        />
        <Divider />
        {starMenuItem}
      </IconMenu>
    )
  },
  handleDeleteFile: function () {
    return this.props.actions.deleteFile(this.props.data.id)
  },
  handleDownloadFile: function() {
    // TODO: download file for user
    return
  },
  handleRenameFile: function () {
    return this.props.actions.renameFile(this.props.data.id)
  },
  handleStarFile: function () {
    return
  },
  render: function () {
    const dataUrl = this.getDataUrl()
    const leftIconName = this.getLeftIconName()
    return (
      <ListItem
        className='gm-project__file'
        leftIcon={<FontIcon className='material-icons'>{leftIconName}</FontIcon>}
        rightIconButton={this.rightIconMenu()}
        nestedLevel={1}>
        <Link to={dataUrl}>{this.props.data.name}</Link>
      </ListItem>
    )
  }
})

const GMProject = React.createClass({
  getFileIds: function(filetype) {
    return this.props.project.files.filter(file => file.filetype === filetype).map(file => file.id)
  },
  render: function () {
    const dataList = this.props.project.files.map((file, i) =>
      <GMProjectContent
        key={i}
        data={file}
        actions={this.props.actions}
      />
    )

    return (
      <ListItem
        className='gm-project__container'
        primaryText={this.props.project.name}
        leftIcon={<FontIcon className='material-icons'>folder</FontIcon>}
        initiallyOpen={true}
        primaryTogglesNestedList={true}
        nestedItems={dataList}
      />
    )
  }
})

var GMProjectList = React.createClass({
  render: function () {
    return (
      <div>
        {
          this.props.projects.map((project, i) =>
            <GMProject
              key={i}
              project={project}
              actions={this.props.actions}
            />
          )
        }
      </div>
    )
  }
})

var GMProjectSearch = React.createClass({
  getInitialState: function () {
    return {dataSource: []}
  },
  componentWillReceiveProps: function (nextProps) {
    const dataSource = nextProps.projects.reduce(function (a, b) {
      return a.concat(b.files.reduce(function (c, d) {
        return c.concat(d.name)
      }, []))
    }, [])
    this.setState({ dataSource })
  },
  render: function () {
    return (
      <ListItem
        primaryText=''
        disabled={true}
        leftIcon={<FontIcon className='material-icons'>search</FontIcon>}
        style={{display: 'inline'}}>
        <AutoComplete
          hintText='Search for files'
          dataSource={this.state.dataSource}
          filter={AutoComplete.caseInsensitiveFilter}
          style={{width: 'inherit'}} />
      </ListItem>
    )
  }
})

class GMProjectMenu extends Component {
  render () {
    return (
      <List>
        <GMProjectList projects={this.props.projects} actions={this.props.projectActions} />
        <Divider />
        <GMImportDialog
          submit={this.props.importDataSubmit}
          projects={this.props.projects}
        />
        <GMProjectSearch projects={this.props.projects} />
      </List>
    )
  }
}

GMProjectMenu.propTypes = {
  projects: PropTypes.array.isRequired,
  projectActions: PropTypes.object.isRequired,
  importDataSubmit: PropTypes.func.isRequired
}

export default GMProjectMenu
