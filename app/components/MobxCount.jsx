import React, {Component} from 'react'
import {observer} from 'mobx-react'

class MCount extends Component{
  render(){
  return(
    <div>
      {this.props.appState.timer}
    </div>
  )
}
}

export default observer(MCount)
