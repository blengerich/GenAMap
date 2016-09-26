import React from 'react'

import fetch from './fetch'
import config from '../../config'

const styles = {
  action: {
    margin: '10px 0',
    width: '70%'
  },
  appBar: {
    backgroundColor: config.ui.baseColor,
    marginBottom: '5%'
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    position: 'absolute',
    width: '100%',
    height: '100%'
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
      <div style={styles.background}>
      OOOPS!
        <br/>
          {this.props.params.name}
      </div>
    )
  }
})

export default GMErrorPage
