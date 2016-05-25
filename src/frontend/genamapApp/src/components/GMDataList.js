import React from 'react'
import Table from 'material-ui/lib/table/table'
import TableHeaderColumn from 'material-ui/lib/table/table-header-column'
import TableRow from 'material-ui/lib/table/table-row'
import TableHeader from 'material-ui/lib/table/table-header'
import TableRowColumn from 'material-ui/lib/table/table-row-column'
import TableBody from 'material-ui/lib/table/table-body'

const GMDataTable = React.createClass({
  render: function () {
    const data = this.props.data.map((row, i) => {
      return (
        <TableRow key={i} selectable={false}>
          {
            row.split(',').map((entry, j) =>
              <TableRowColumn key={j}>{entry}</TableRowColumn>
            )
          }
        </TableRow>
      )
    })
    const headers = this.props.headers.map((columnName, i) =>
      <TableHeaderColumn key={i}>{columnName}</TableHeaderColumn>
    )
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            {headers}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {data}
        </TableBody>
      </Table>
    )
  }
})

const GMDataList = React.createClass({
  render: function () {
    return (
      <div className='dataList'>
        <h1>{this.props.title}</h1>
        <GMDataTable data={this.props.data} headers={this.props.headers} />
      </div>
    )
  }
})

export default GMDataList
