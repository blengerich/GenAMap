import React from 'react'

import AutoComplete from 'material-ui/lib/auto-complete'

const GMProjectSearch = React.createClass({
  getInitialState: function () {
    return {dataSource: ['a']}
  },
  componentWillReceiveProps: function (nextProps) {
    var newState = {}
    if (nextProps.data !== null) newState.data = nextProps.data
    this.setState(newState)
  },
  render: function () {
    return (
      <AutoComplete
        hintText='Search for files'
        dataSource={this.state.dataSource}
        filter={AutoComplete.caseInsensitiveFilter}
        style={{width: 'inherit'}}
      />
    )
  }
})

export default GMProjectSearch
