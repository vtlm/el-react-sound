import React,{Component} from 'react';


export default class SoundTrackLine extends Component{

  // componentDidMount(){
  //   console.log('SoundTrackLine DidMount')
  //   console.log(this.state, this.props)
  //   this.setState({play_attempts : this.props.rawData.play_attempts?this.props.rawData.play_attempts:0});
  // }

//   componentWillReceiveProps(nextProps:any){
//     console.log('SoundTrackLine DidMount')
//     console.log(this.state, this.props)
//     this.setState({play_attempts : nextProps.rawData.play_attempts?nextProps.rawData.play_attempts:0});
//   }


  render(){
    // if(!this.state)
    //   return null;
    return(
    <a href='#' onClick={(e)=>{e.preventDefault();
      this.props.callBack(this.props.ind)
      }}>
    <div style={{color:this.props.selected?"#ff0000":"#000000"}}>
      {this.props.ind}.&nbsp;
      {this.props.rawData.id} &nbsp;
      {this.props.rawData.path} &nbsp;
      {this.props.rawData.play_attempts} &nbsp;
      {this.props.rawData.played_times} &nbsp;
    </div>
    </a>
  )
  }
}
