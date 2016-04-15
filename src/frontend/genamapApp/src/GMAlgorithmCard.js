var React = require('react');
var Checkbox = require('material-ui/lib/checkbox');
var Card = require('material-ui/lib/card/card');
var CardMedia = require('material-ui/lib/card/card-media');
var CardTitle = require('material-ui/lib/card/card-title');
var CardText = require('material-ui/lib/card/card-text');

var GMAlgorithmCard = React.createClass({
  handleOnCheck: function (event) {
    this.props.handleChangeAlgorithm(this.props.algorithm);
  },
  render: function () {
    return (
      <Card style={this.props.style}>
        <CardMedia>
          <img src="http://lorempixel.com/200/137/nature/" />
        </CardMedia>
        <CardText>
          <Checkbox label={this.props.algorithm.name}
                    labelPosition="left" 
                    disabled={this.props.disabled}
                    onCheck={this.handleOnCheck} />
          <br/>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </CardText>
      </Card>
    );
  }
});

module.exports = GMAlgorithmCard