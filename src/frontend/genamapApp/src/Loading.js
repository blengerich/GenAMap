var React = require('react');

var Loading = React.createClass({
  render: function () {
    return (
      <div className="gm-loading__bg">
        <img src="images/dna.png" className="gm-loading__img" />
        <h2>Loading...</h2>
      </div>
    );
  }
});

module.exports = Loading;