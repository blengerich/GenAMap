import React from 'react'
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table'
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
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        this.setState({
          title: json.message,
          data: undefined
        })
        Promise.reject(json.message)
      } else {
        const data = json.data.split('\n')
        const headers = data[0].split(',')
        data.splice(0, 1)
        this.setState({
          title: json.file.name,
          data,
          headers
        })
      }
    }).catch(err => console.log('Error: ', err))
  },
  componentWillReceiveProps: function (nextProps) {
    this.loadData(nextProps.params.id)
  },
  render: function () {
    return this.state.data ? (
      <div>
        <h1>{this.state.title}</h1>
        <GMDataTable data={this.state.data} headers={this.state.headers} />
      </div>
    ) : (
      <div>
        <h1>{this.state.title}</h1>
      </div>
    )
  }
})

export default GMDataList
