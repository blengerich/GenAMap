import React, { Component, PropTypes } from 'react'
import FlatButton from 'material-ui/lib/flat-button'
import TextField from 'material-ui/lib/text-field'

const styles = {
  fileInput: {
    display: 'none'
  },
  fileInputButton: {
    marginRight: '7px'
  }
}

class GMFileInput extends Component {

  onChange (event) {
    this.props.onChange(event)
  }

  getInputEl (target) {
    return target.nextSibling
  }

  onClick (event) {
    const inputEl = this.getInputEl(event.currentTarget)
    inputEl.click()
  }

  render () {
    return (
      <div className='file-field-wrapper'>
        <FlatButton
          label={this.props.buttonLabel}
          style={styles.fileInputButton}
          onClick={this.onClick.bind(this)}
        />
        <input
          type='file'
          accept={this.props.accept}
          style={styles.fileInput}
          onChange={this.onChange.bind(this)}
          />
        <TextField
          value={this.props.fileLabel}
          disabled={true}
        />
      </div>
    )
  }
}

GMFileInput.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  accept: PropTypes.string,
  onChange: PropTypes.func,
  fileLabel: PropTypes.string.isRequired
}

export default GMFileInput
