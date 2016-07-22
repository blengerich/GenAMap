import React from 'react'
import Table from 'material-ui/lib/table/table'
import TableHeaderColumn from 'material-ui/lib/table/table-header-column'
import TableRow from 'material-ui/lib/table/table-row'
import TableHeader from 'material-ui/lib/table/table-header'
import TableRowColumn from 'material-ui/lib/table/table-row-column'
import TableBody from 'material-ui/lib/table/table-body'

import fetch from './fetch'
import config from '../../config'

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
  getInitialState: function () {
    return {data: [], headers: [], title: ''}
  },
  componentDidMount: function () {
    this.loadData(this.props.params.id)
  },
  loadData: function (id) {
    let dataRequest = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    fetch(`${config.api.dataUrl}/${id}`, dataRequest)
    .then(response => {
      if (!response.ok) Promise.reject(response.json())
      return response.json()
    }).then(json => {
      const data = json.data.split('\n')
      const headers = data[0].split(',')
      data.splice(0, 1)
      this.setState({
        title: json.file.name,
        data,
        headers
      })
    }).catch(err => console.log('Error: ', err))
  },
  componentWillReceiveProps: function (nextProps) {
    this.loadData(nextProps.params.id)
  },
  render: function () {
    return (
      <div>
        <h1>{this.state.title}</h1>
        <GMDataTable data={this.state.data} headers={this.state.headers} />
      </div>
    )
  }
})

export default GMDataList
