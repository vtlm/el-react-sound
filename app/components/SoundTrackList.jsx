import React,{Component} from 'react';
// import { RouteComponentProps } from 'react-router';
// import { Link } from 'react-router-dom';
import { Client, QueryResult } from 'pg';
import JSONTree from 'react-json-tree'
//import Sound from 'react-sound';
import Wavesurfer from 'react-wavesurfer'
// import jsmediatags from 'jsmediatags'
// import ReactHowler from 'react-howler'

import TimeLine from 'react-wavesurfer'///plugins/timeline'
import MiniMap from 'react-wavesurfer'///plugins/timeline'
import SoundTrackLine from './SoundTrackLine'

// let styles = require('./Counter.scss');

var jsmediatags = require("jsmediatags")

import {action,observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
//import { FormState, FieldState } from 'formstate';

import MCount from './MobxCount'

var appState = observable({
    timer: 0
});
appState.resetTimer = action(function reset() {
    appState.timer = 0;
});

setInterval(action(function tick() {
    appState.timer += 1;
    // console.log('inc',appState.timer)
}), 1000);

// class AppState {
//  timer = 0;
//   // @observable currentTime:string;
//   // @observable tagJSON:any={title:"No Song"}
// constructor() {
//         setInterval(() => {
//             console.log('tmr',this.timer)
//             this.timer += 1;
//         }, 1000);
//     }
//
//     resetTimer() {
//         this.timer = 0;
//     }
// }

// const appState=observable(new AppState())


// class TimerView extends Component {
//     render() {
//         return (
//             <div>
//                 <button onClick={this.onReset}>
//                     Seconds passed: {this.props.appState.timer}
//                 </button>
//                 <DevTools />
//             </div>
//         );
//      }
//
//      onReset = () => {
//          this.props.appState.resetTimer();
//      }
// };


// const TimerView = observer((props) =>{return
//     <span>Seconds passed: { props.appState.timer } </span>}
// );


// const TimerView=observable.box(TimerView2)

@observer
class TimeView extends Component{
  render(){
    return(
      <div>
        <JSONTree data={this.props.appState.tagJSON} />
        {this.props.appState.currentTime}
      </div>
    )
  }
}

const MCount2=observer(class MCount1 extends Component{
  render(){
  return(
    <div>
      {this.props.appState.timer}
    </div>
  )
}
})



//const appState = new AppState();


// class DemoState {
//   // Create a field
//   username = new FieldState('').validators((val) => !val && 'username required');
//
//   // Compose fields into a form
//   form = new FormState({
//     username: this.username
//   });
//
//   onSubmit = async () => {
//     //  Validate all fields
//     const res = await this.form.validate();
//     // If any errors you would know
//     if (res.hasError) {
//       console.log(this.form.error);
//       return;
//     }
//     // Yay .. all good. Do what you want with it
//     console.log(this.username.$); // Validated value!
//   };
// }

//@observer
export class Demo extends Component<{},{}> {
  data = new DemoState();
  render(){
    const data = this.data;
    return (
// onSubmit={data.onSubmit}>
      <form>
        <input
          type="text"
          value={data.username.value}
          // onChange={(e)=>data.username.onChange(e.target.value)}
        />
        <p>{data.username.error}</p>
        <p>{data.form.error}</p>
      </form>
    );
  }
}


export class SoundTrackList extends Component {

  dbConnnection = {
    user: 'v',
    host: 'localhost',
    database: 'mydb',
    password: '12',
    port: 5432,
  }

  state = {
    //soundStatus: Sound.status.STOPPED,
    playing:false,
    searchStr:"LZ",
    tagJSON:{tit:"No Song"}
  }

  dbClientQuery = (query: string, params: any[], callBack: (res: any) => void) => {
    let client = new Client(this.dbConnnection)
    client.connect()
    //console.log('dbCient!',query,params)
    client.query(query, params, (err, res) => {
      if (err) {
        console.log(err)
      } else {
        callBack(res)
      }
      client.end()
    })

  }

  componentDidMount() {
    // console.log('SoundTrackList: DidMount')

    this.dbClientQuery("SELECT * FROM songs1 WHERE path LIKE $1 ORDER BY path ASC",
      ['%' + 'LZ' + '%'], (res) => {
        this.setState({ dbQueryResult: res });
        this.setState({ rows: res.rows })
      })
  }

  setTrack = (rawData) => {
    // let ind=this.state.dbQueryResult.rows.indexOf(rawData)

    let ind = rawData;

    if (ind == this.state.currentTrackIndex) {
      // let soundStatus = (this.state.soundStatus == Sound.status.STOPPED ||
      //   this.state.soundStatus == Sound.status.PAUSED) ? Sound.status.PLAYING : Sound.status.PAUSED

      this.setState({
        // soundStatus: soundStatus,
        playing: !this.state.playing
      })
    } else {

      let rows1 = this.state.rows.slice();
      rows1[ind].play_attempts += 1;


      this.setState({
        currentTrackIndex: ind,
        rows: rows1,
        // soundStatus: Sound.status.PLAYING,
        playing: true,
        cName: "file://" + this.state.rows[ind].path,
      })

      console.log(this.state.rows[ind].path)
      jsmediatags.read(this.state.rows[ind].path, {
        onSuccess: function(tag:any) {
          console.log(tag);
          appState.tagJSON=tag
        },
        onError: function(error:any) {
          console.log(':(', error.type, error.info);
        }
      });

      this.dbClientQuery('UPDATE songs1 SET play_attempts = coalesce(songs1.play_attempts,0)+1 WHERE id = $1',
          [rows1[ind].id],(res)=>{})
    }
  }

  handleSongLoading = (p1: number, p2: number, p3: number) => {
    //console.log('onLoading:',p1,p2,p3)
  }

  handleSongLoad = (p1: any) => {
    // console.log('onLoad:',p1)
    this.setState({ trackFullTime: this.millisToMinutesAndSeconds(p1.duration) })
  }

  handleSongPlaying = (p1: any) => {
    // console.log('onPlaying:',p1.position,p1.duration)
    this.setState({ trackCurrentTime: this.millisToMinutesAndSeconds(p1.position) })
  }

  handleAudioProcess = (ws: any) => {
    // console.log(ws.wavesurfer.getCurrentTime(),ws.wavesurfer.getDuration())
    appState.currentTime=this.secondsToMinutesAndSeconds(ws.wavesurfer.getCurrentTime())
//    this.setState({ trackCurrentTime: this.secondsToMinutesAndSeconds(ws.wavesurfer.getCurrentTime()) })
  //  this.setState({ trackFullTime: this.secondsToMinutesAndSeconds(ws.wavesurfer.getDuration()) })
  //  this.setState({ trackCurrentTime: '2' })
  }

  onReadyWs=(ws:any)=>{
   this.setState({ trackFullTime: this.secondsToMinutesAndSeconds(ws.wavesurfer.getDuration()) })
  }

  handleFinishedPlaying = () => {
    //console.log('STOP!');
    let ind = this.state.currentTrackIndex
    let nextInd: number = this.state.currentTrackIndex == this.state.rows.length - 1 ? 0 : this.state.currentTrackIndex + 1

    let rows1 = this.state.rows.slice();
    rows1[ind].played_times += 1;
    rows1[nextInd].play_attempts += 1;

    this.setState({
      currentTrackIndex: nextInd,
      rows: rows1,
      cName: "file://" + this.state.rows[nextInd].path
    })

    this.dbClientQuery('UPDATE songs1 SET played_times = coalesce(songs1.played_times,0)+1 WHERE id = $1',
      [rows1[ind].id], (res) => { })
    this.dbClientQuery('UPDATE songs1 SET play_attempts = coalesce(songs1.play_attempts,0)+1 WHERE id = $1',
      [rows1[nextInd].id], (res) => { })
  }

  millisToMinutesAndSeconds = (millis: number): string => {
    let minutes = Math.floor(millis / 60000);
    let seconds: number = ((millis % 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
  }

  secondsToMinutesAndSeconds = (millis: number): string => {
    let minutes = Math.floor(millis / 60);
    let seconds: number = ((millis % 60) / 1);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
  }

  handleSubmit = (user: any) => {
    //    console.log('submit user', user)

    this.dbClientQuery("SELECT * FROM songs1 WHERE path LIKE $1 ORDER BY path ASC",
      ['%' + user.firstName + '%'], (res) => {
        this.setState({ dbQueryResult: res });
        this.setState({
          currentTrackIndex: undefined,
          rows: res.rows,
          soundStatus: Sound.status.STOPPED
        })
      })
  }

  searchOnChange=(evt:any)=>{this.setState({searchStr:evt.target.value})}
  searchOnSubmit=(evt:any)=>{
    evt.preventDefault();
    this.dbClientQuery("SELECT * FROM songs1 WHERE path LIKE $1 ORDER BY path ASC",
    ['%' + this.state.searchStr + '%'], (res) => {
      this.setState({ dbQueryResult: res });
      this.setState({
        currentTrackIndex: undefined,
        rows: res.rows,
        //soundStatus: Sound.status.STOPPED
      })
    })
}
  render() {
    // const { //increment, //incrementIfOdd, incrementAsync, decrement,
    //   sound } = this.props;
    //    console.log('SoundTrackList render, state= ',this.state)

    const timelineOptions = {
      timeInterval: 0.5,
      height: 30,
      // primaryFontColor: '#ff0000',
      // primaryColor: '#00ff00'
    };
    const minimapOptions = {
      height: 30,
      waveColor: '#ddd',
      progressColor: '#999',
      cursorColor: '#999'
    };

    // <TimerView appState={appState} />


    return (
      <div>

      <MCount appState={appState} />
      <MCount appState={appState} />
      <MCount appState={appState} />
      <MCount2 appState={appState} />)}

            {/* <ReactHowler
            src={['http://goldfirestudios.com/proj/howlerjs/sound.ogg'] }
            /> */}


        {/* <Demo /> */}
        <form onSubmit={this.searchOnSubmit}>
        <input
          type="text"
          value={this.state.searchStr}
          onChange={this.searchOnChange}
        />
      </form>

        <div>
          {this.state && this.state.cName ?
            <div>Now playing {this.state.cName}</div>
            : "No Sound"
          }
          {
            this.state && this.state.trackFullTime ?
              <div style={{display:"flex"}}>
                <TimeView appState={appState} /> &nbsp; of &nbsp;
            {this.state.trackFullTime}
              </div>
              : null
          }
          {this.props.search}
          {this.props.soundLib}
        </div>


        {this.state && this.state.cName ?
          <div className="example col-xs-12">

            <Wavesurfer
              audioFile={this.state.cName}
              pos={0}
              options={{splitChannels:true,
                waveColor: '#ff0000',
                height: 50
              }}
              // onPosChange={this.handlePosChange}
              playing={this.state.playing}
              onReady={this.onReadyWs}
              onAudioprocess={this.handleAudioProcess}
              onFinish={this.handleFinishedPlaying}
            >
              <MiniMap options={minimapOptions} />
              <TimeLine options={timelineOptions} />
            </Wavesurfer>

            {/* <Sound
              url={this.state.cName}
              playStatus={this.state.soundStatus}
              // playFromPosition={300 /* in milliseconds * /}
              onLoading={this.handleSongLoading}
              onLoad={this.handleSongLoad}
              onPlaying={this.handleSongPlaying}
              onFinishedPlaying={this.handleFinishedPlaying}
            /> */}
          </div> : "No Sound"}

        <div style={{ border: "1px solid #ff0000", overflow: "scroll", height: "80vh" }}>

          {this.state && this.state.rows ?
            this.state.rows.slice(0, 750).map((x, k) => //<div>key={k}{k}</div>)
              <SoundTrackLine selected={k == this.state.currentTrackIndex} ind={k} key={k} rawData={x} callBack={this.setTrack} />)
            : "No List"}

        </div>
      </div>
    );
  }
}

export default SoundTrackList;
