var React = require('react');
var ReactDOM = require('react-dom');

var BugAdd = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var form = document.forms.bugAdd;
    this.props.addBug({owner: form.owner.value, title: form.title.value, status: 'New', priority: '1'});
    form.owner.value = "";
    form.title.value = "";
  },
  render: function() {
    return (
      <div>
        <form name="bugAdd" onSubmit={this.handleSubmit}>
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input className="mdl-textfield__input" type="text" id="owner" name="owner" />
            <label className="mdl-textfield__label">Owner</label>
          </div>
          <br />
          <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input className="mdl-textfield__input" type="text" id="title" name="title" />
            <label className="mdl-textfield__label">Title</label>
          </div>
          <br />
          <button type="submit" className="mdl-button mdl-js-button mdl-button--raised">Add Bug</button>
        </form>
      </div>
    );
  }
});

module.exports = BugAdd;