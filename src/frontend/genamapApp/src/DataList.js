var React = require('react');
var Link = require('react-router').Link;
var Table = require('material-ui/lib/table/table');
var TableHeaderColumn = require('material-ui/lib/table/table-header-column');
var TableRow = require('material-ui/lib/table/table-row');
var TableHeader = require('material-ui/lib/table/table-header');
var TableRowColumn = require('material-ui/lib/table/table-row-column');
var TableBody = require('material-ui/lib/table/table-body');

var GetRequest = require('./Requests').GetRequest;

var DataTable = React.createClass({
  render: function() {
    var dataPoints = this.props.data.map(function (datapoint, i, array) {
      datapoint = datapoint.split(',');
      return (
        <TableRow key={i} selectable={false}>
          <TableRowColumn>{datapoint[0]}</TableRowColumn>
          <TableRowColumn>{datapoint[1]}</TableRowColumn>
          <TableRowColumn>{datapoint[2]}</TableRowColumn>
        </TableRow>
      );
    });
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Trait</TableHeaderColumn>
            <TableHeaderColumn>Marker</TableHeaderColumn>
            <TableHeaderColumn>Correlation</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {dataPoints}
        </TableBody>
      </Table>
    );
  }
});

var DataList = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function () {
    this.loadData(this.props.params.id);
  },
  loadData: function (id) {
    GetRequest('api/data/' + id, {}, (response) => {
      this.setState({data: response.data.split('\n'), name: response.file.name});
    });
  },
  componentWillReceiveProps: function (nextProps) {
    this.loadData(nextProps.params.id);
  },
  render: function() {
    return (
      <div className="dataList">
        <h1>{this.state.name}</h1>
        <DataTable data={this.state.data} />
      </div>
    );
  }
});

module.exports = DataList;