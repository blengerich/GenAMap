var React = require('react');
var Link = require('react-router').Link;
var Divider = require('material-ui/lib/divider');
var IconMenu = require('material-ui/lib/menus/icon-menu');
var Menu = require('material-ui/lib/menus/menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var List = require('material-ui/lib/lists/list');
var ListItem = require('material-ui/lib/lists/list-item');
var ContentInbox = require('material-ui/lib/svg-icons/content/inbox');
var IconButton = require('material-ui/lib/icon-button');
var FontIcon = require('material-ui/lib/font-icon');
var Divider = require('material-ui/lib/divider');
var AutoComplete = require('material-ui/lib/auto-complete');

var GMImportDialog = require('./GMImportDialog');
var GetRequest = require('./Requests').GetRequest;
var PostRequest = require('./Requests').PostRequest;
var FilePostRequest = require('./Requests').FilePostRequest;

var iconButtonElement = (
  <IconButton touch={true}>
    <FontIcon className="material-icons">more_vert</FontIcon>
  </IconButton>
);

var rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem primaryText="Some Action" />
    <MenuItem primaryText="Another Action" />
    <Divider />
    <MenuItem primaryText="One More Action" />
    <MenuItem primaryText="Last Action" disabled={true} />
  </IconMenu>
);

var GMProjectContent = React.createClass({
  render: function () {
    return (
      <ListItem className="gm-project__file" 
                leftIcon={<FontIcon className="material-icons">assessment</FontIcon>} 
                rightIconButton={rightIconMenu}
                nestedLevel={1}>
        <Link to={"/visualization/matrix/" + this.props.data.id}>{this.props.data.name}</Link>
      </ListItem>
    );
  }
});

var GMProject = React.createClass({
  render: function () {
    var dataList = this.props.project.data.map(function (data) {
      return (
        <GMProjectContent key={data.id} data={data} />
      );
    });
    return (
      <ListItem className="gm-project__container"
                primaryText={this.props.project.name}
                leftIcon={<FontIcon className="material-icons">folder</FontIcon>}
                initiallyOpen={true}
                primaryTogglesNestedList={true}
                nestedItems={dataList}
      />
    );
  }
});

var GMProjectList = React.createClass({
  render: function () {
    var projectList = this.props.projects.map(function (project) {
      return (
        <GMProject key={project.id} project={project} />
      );
    });
    return (
      <div>
        {projectList}
      </div>
    );
  }
});

var GMProjectSearch = React.createClass({
  getInitialState: function () {
    return {dataSource: []};
  },
  componentWillReceiveProps: function (nextProps) {
    var data = nextProps.projects.reduce(function (a, b) {
      return a.concat(b.data.reduce(function (c, d) {
        return c.concat(d.name);
      }, []));
    }, []);
    this.setState({dataSource: data});
  },
  render: function () {
    return (
      <ListItem primaryText="" disabled={true}
                leftIcon={<FontIcon className="material-icons">search</FontIcon>}
                style={{display: "inline"}}>
        <AutoComplete
          hintText="Search for files"
          dataSource={this.state.dataSource} 
          filter={AutoComplete.caseInsensitiveFilter}
          style={{width: "inherit"}} />
      </ListItem>
    );
  }
});

var GMImportData = React.createClass({
  render: function () {
    return (
      <a className="mdl-navigation__link" href="" id="show-gm-dialog__import">
        <i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">add</i>
        Import Data
      </a>
    );
  }
});

var GMProjectMenu = React.createClass({
  getInitialState: function () {
    return {projects: []};
  },
  componentDidMount: function () {
    this.loadData();
  },
  loadData: function () {
    GetRequest(this.props.projectUrl, {}, (projects) => {
      this.setState({projects: projects});
    });
  },
  submit: function (form) {
    FilePostRequest(this.props.importDataUrl, form, (processedData) => {
      // console.log(processedData);
      this.loadData();
    });
  },
  render: function () {
    return (
      <List>
        <GMProjectList projects={this.state.projects} />
        <Divider />
        <GMImportDialog projectUrl={this.props.projectUrl} 
                        speciesUrl={this.props.speciesUrl} 
                        submit={this.submit} />
        <GMProjectSearch projects={this.state.projects} />
      </List>
    );
  }
});

module.exports = GMProjectMenu;