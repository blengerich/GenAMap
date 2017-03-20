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
import GMGDCDialog from './GMGDCDialog'

const GMProjectContent = React.createClass({
  getDataUrl: function() {
    const file = this.props.data
    console.log(file)
    if (file.filetype === 'resultFile' && file.info.resultType === 'matrix') {
      const markerLabelId = file.info.labels.marker
      const traitLabelId = file.info.labels.trait
      return '/visualization/matrix/' + markerLabelId + '/' + traitLabelId + '/' + file.id
    } else if (file.filetype === 'resultFile' && file.info.resultType === 'dendrogram') {
      const markerLabelId = file.info.labels.marker
      const traitLabelId = file.info.labels.trait
      const tree1Id = file.info.clusterings.tree1
      const tree2Id = file.info.clusterings.tree2
      return '/visualization/dendrogram/' + markerLabelId + '/' + traitLabelId + '/' + file.id + '/' + tree1Id + '/' + tree2Id
    } else {
      return '/data/' + file.id
    }
  },
  getLeftIcon: function() {
    const filetype = this.props.data.filetype
    if (filetype === 'markerFile' || filetype === 'traitFile') {
      return <FontIcon className='material-icons'>assessment</FontIcon>
    } else if (filetype === 'resultFile') {
      return <FontIcon className='material-icons'>view_module</FontIcon>
    } else if (filetype === 'markerLabelFile' || filetype === 'traitLabelFile') {
      return <FontIcon className='material-icons'>label</FontIcon>
    } else {
      return <FontIcon className='material-icons'>assessment</FontIcon>
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
    this.props.actions.downloadFile(this.props.data.id)
    return
  },
  handleRenameFile: function () {
    return this.props.actions.renameFile(this.props.data.id)
  },
  handleStarFile: function () {
    return
  },
  render: function () {
    console.log(this.props.data.name)
    return (
      <ListItem
        className='gm-project__file'
        leftIcon={this.getLeftIcon()}
        rightIconButton={this.rightIconMenu()}
        nestedLevel={3}>
        <Link to={this.getDataUrl()}>{this.props.data.name}</Link>
      </ListItem>
    )
  }
})

const GMProjectItem = React.createClass({
  render: function() {
    const fileList = this.props.files.map((file, i) =>
      <GMProjectContent
        key={i}
        data={file}
        actions={this.props.actions}
      />
    )

    return (
      <ListItem
        primaryText={this.props.name}
        leftIcon={<FontIcon className='material-icons'>folder</FontIcon>}
        initiallyOpen={false}
        primaryTogglesNestedList={true}
        nestedItems={fileList}
        nestedLevel={1}
      />
    )
  }
})

const GMProject = React.createClass({
  render: function () {
    const items = this.props.project.items
    /*const folderList = [...project.markers,
                        ...project.traits,
                        ...project.snpsFeatures,
                        ...project.populations,
                        results].map(this.createFolderView)*/
    const dataList = Object.keys(items).map((itemName, i) =>
      <GMProjectItem
        key={i}
        name={itemName}
        files={items[itemName].files}
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

class GMProjectMenu extends Component {
  render () {
    console.log(this.props.projects)
    return (
      <List>
        <GMProjectList projects={this.props.projects} actions={this.props.projectActions} />
        <Divider />
        <GMImportDialog
          submit={this.props.importDataSubmit}
          projects={this.props.projects}
        />
        <GMGDCDialog
          submit={this.props.importDataSubmit}
          projects={this.props.projects}
        />
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
