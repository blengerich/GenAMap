var React = require('react');

var GMTopMenu = require('./GMTopMenu');
var GMLeftMenu = require('./GMLeftMenu');
var GMRightMenu = require('./GMRightMenu');

const settings = {
  projectUrl: '/api/projects',
  speciesUrl: '/api/species',
  algorithmUrl: '/api/algorithms',
  importDataUrl: '/api/import-data',
  runAnalysisUrl: '/api/run-analysis',
  navWidth: 300,
  minPad: 24,
};

var GMApp = React.createClass({
  getInitialState: function () {
    return {leftNavOpen: true, 
            rightNavOpen: false, 
            paddingLeft: settings.navWidth + settings.minPad,
            paddingRight: settings.minPad
           };
  },
  handleLeftIconTouch: function () {
    this.toggleLeftNav();
  },
  handleRightIconTouch: function () {
    this.toggleRightNav();
  },
  toggleLeftNav: function () {
    var padLeft = (this.state.leftNavOpen) ? settings.minPad : settings.navWidth + settings.minPad;
    this.setState({leftNavOpen: !this.state.leftNavOpen, paddingLeft: padLeft + 'px'});
  },
  toggleRightNav: function () {
    var padRight = (this.state.rightNavOpen) ? settings.minPad : settings.navWidth + settings.minPad;
    this.setState({rightNavOpen: !this.state.rightNavOpen, paddingRight: padRight + 'px'});
  },
  render: function () {
    var childrenWithProps = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, { left: this.state.paddingLeft,
                                           right: this.state.paddingRight,
                                           minPad: settings.minPad
                                          });
    });
    return (
      <div>
        <GMTopMenu 
          projectUrl={settings.projectUrl} 
          algorithmUrl={settings.algorithmUrl}
          runAnalysisUrl={settings.runAnalysisUrl}
          handleLeftIconTouch={this.handleLeftIconTouch}
          handleRightIconTouch={this.handleRightIconTouch} 
          style={{paddingLeft: this.state.paddingLeft, 
                  paddingRight: this.state.paddingRight
                }} 
        />
        <GMLeftMenu 
          projectUrl={settings.projectUrl} 
          speciesUrl={settings.speciesUrl}
          importDataUrl={settings.importDataUrl}
          open={this.state.leftNavOpen} 
          width={settings.navWidth}
        />
        <GMRightMenu 
          open={this.state.rightNavOpen}
          width={settings.navWidth} 
        />
        <main 
          className="gm-layout__content" 
          style={{paddingLeft: this.state.paddingLeft, 
                  paddingRight: this.state.paddingRight,
                }}
        >
          {childrenWithProps}
        </main>
      </div>
    );
  }
});

module.exports = GMApp