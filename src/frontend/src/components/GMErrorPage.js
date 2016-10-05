import React from 'react'

import fetch from './fetch'
import config from '../../config'

const styles = {
  textStyle: {
    fontFamily: Raleway,
    marginTop: '100px',
    textAlign: center
  }
}

const GMErrorPage = React.createClass({
  componentDidMount() {
    this.loadData(this.props.params),
    this.setState({ pageParams: [] })
  },
  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps.params)
  },
  getInitialState() {
    return {
      pageParams: []
    }
  },
  loadData: function (params) {
    this.setState({
      error: params
    })
  },
  render() {
    return (
      <head>
        <link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet"></link>
      </head>
      <body style={styles.textStyle}>
          <h1>Error!</h1>
          <img style="width: 300px; height: 300px" src="../images/sad-face.svg"/>
          <p>Sorry, but your input was invalid.</p>
          <p>Check: {this.props.params.name}</p>
      </body>
    )
  }
})

export default GMErrorPage