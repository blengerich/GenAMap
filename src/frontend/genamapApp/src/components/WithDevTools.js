import React from 'react'

import DevTools from './DevTools'

export function addDevTools (Component) {
  class WithDevTools extends React.Component {

    render () {
      return (
        <div>
          <DevTools />
          <Component {...this.props} />
        </div>
      )
    }
  }

  return WithDevTools
}
