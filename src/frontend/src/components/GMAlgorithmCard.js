import React from 'react'
import Checkbox from 'material-ui/Checkbox'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

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
