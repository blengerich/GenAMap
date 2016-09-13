import React from 'react'
import Checkbox from 'material-ui/lib/checkbox'
import Card from 'material-ui/lib/card/card'
import CardMedia from 'material-ui/lib/card/card-media'
import CardText from 'material-ui/lib/card/card-text'

const GMAlgorithmCard = React.createClass({
  handleOnCheck: function (event) {
    this.props.handleChangeAlgorithm(this.props.algorithm)
  },
  render: function () {
    return (
      <Card style={this.props.style}>
        {!!this.props.algorithm.image &&
          <CardMedia>
            <img src={this.props.algorithm.image} />
          </CardMedia>
        }
        <CardText>
          <Checkbox
            label={this.props.algorithm.name}
            labelPosition='left'
            disabled={this.props.disabled}
            onCheck={this.handleOnCheck}
          />
          <br />
          {!!this.props.algorithm.info && this.props.algorithm.info}
        </CardText>
      </Card>
    )
  }
})

export default GMAlgorithmCard
