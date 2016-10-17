import React from 'react'
import LeftNav from 'material-ui/lib/left-nav'
import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

const styles = {
  tabs: {
    backgroundColor: 'transparent'
  },
  tab: {
    color: '#00bcd4'
  }
}

const GMRightMenu = React.createClass({
  render: function () {
    return (
      <LeftNav open={this.props.open} openRight={true} width={this.props.width}>
        <Tabs tabItemContainerStyle={styles.tabs}>
          <Tab label='Starred' style={styles.tab} />
          <Tab label='Subsets' style={styles.tab} />
        </Tabs>
      </LeftNav>
    )
  }
})

export default GMRightMenu