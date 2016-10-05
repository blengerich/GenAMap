import React from 'react'

import fetch from './fetch'
import config from '../../config'

const styles = {
  action: {
    margin: '10px 0',
    width: '70%'
  },
  error: {
    color: '#e74c3c'
  },
  largeFace: {
    color: '#ecf0f1',
    fontSize: '10em',
    margin: '50px 0px'
  },
  appBar: {
    backgroundColor: config.ui.baseColor,
    marginBottom: '5%'
  },
  textStyle: {
    fontFamily: 'Roboto',
    marginTop: '100px',
    textAlign: 'center'
  },
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto, sans-serif',
    position: 'absolute',
    left: '35%',
    top: '20%',
    width: '30%',
    height: '60%',
    textAlign: 'center'
  },
  form: {
    width: '70%'
  },
  header: {
    margin: '0 0 0 10px',
    paddingTop: 0,
    fontFamily: 'Roboto, sans-serif',
    fontSize: '2.2em',
    fontWeight: 400,
    color: '#ffffff',
    lineHeight: '64px'
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
      <div style={styles.textStyle}>
        <h1>Error!</h1>
        <span style={styles.largeFace}>:(</span>
        <p>Sorry, but we ran into an error while trying to change your password!</p>
        <p>Error: <i style={styles.error}>{this.props.params.name}</i></p>
      </div>

    )
  }
})


export default GMErrorPage