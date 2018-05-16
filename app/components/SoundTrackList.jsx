import React, { Component } from 'react'
// import { RouteComponentProps } from 'react-router';
// import { Link } from 'react-router-dom';
import { Client, QueryResult } from 'pg'
import JSONTree from 'react-json-tree'
//import Sound from 'react-sound';
import Wavesurfer from 'react-wavesurfer'
// import jsmediatags from 'jsmediatags'
import ReactHowler from 'react-howler'

import TimeLine from 'react-wavesurfer' ///plugins/timeline'
import MiniMap from 'react-wavesurfer' ///plugins/timeline'
import SoundTrackLine from './SoundTrackLine'
// import WebAudioPlayer from './WebAudioPlayer'

// let styles = require('./Counter.scss');

import { observable } from 'mobx'
import { observer } from 'mobx-react'

var jsmediatags = require('jsmediatags')

class WA {}

const wa = new WA()

class AppState {
  @observable currentTime = 0
  @observable tagJSON = {}
  // constructor() {
  //       this.currentTime=4;
  //         setInterval(() => {
  //             console.log('inc',this.currentTime)
  //             this.currentTime += 1;
  //         }, 1000);
  //     }
}
const appState = new AppState()

@observer
class TimeView extends Component {
  render() {
    return (
      <div>
        <JSONTree data={this.props.appState.tagJSON} />
        {/*{this.props.appState.currentTime}*/}
      </div>
    )
  }
}

export class SoundTrackList extends Component {
  dbConnnection = {
    user: 'v',
    host: 'localhost',
    database: 'mydb',
    password: '12',
    port: 5432
  }

  state = {
    //soundStatus: Sound.status.STOPPED,
    showAttempted: true,
    showPlayed: true,
    audioLib: 'howler',
    playing: false,
    searchStr: 'LZ'
    // tagJSON: { tit: "No Song" }
  }

  dbClientQuery = (
    query: string,
    params: any[],
    callBack: (res: any) => void
  ) => {
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

    this.dbClientQuery(
      'SELECT * FROM songs1 WHERE path LIKE $1 ORDER BY path ASC',
      ['%' + 'Nazare' + '%'],
      res => {
        // this.setState({ dbQueryResult: res });
        this.setState({ rows: res.rows })
      }
    )
  }

  setTrack = rawData => {
    // let ind=this.state.dbQueryResult.rows.indexOf(rawData)

    let ind = rawData

    if (ind == this.state.currentTrackIndex) {
      // let soundStatus = (this.state.soundStatus == Sound.status.STOPPED ||
      //   this.state.soundStatus == Sound.status.PAUSED) ? Sound.status.PLAYING : Sound.status.PAUSED

      this.setState({
        // soundStatus: soundStatus,
        playing: !this.state.playing
      })
    } else {
      let rows1 = this.state.rows.slice()
      rows1[ind].play_attempts += 1

      this.setState({
        currentTrackIndex: ind,
        rows: rows1,
        // soundStatus: Sound.status.PLAYING,
        playing: true,
        cName: 'file://' + this.state.rows[ind].path
      })

      console.log(this.state.rows[ind].path)
      jsmediatags.read(this.state.rows[ind].path, {
        onSuccess: function(tag: any) {
          console.log(tag)
          appState.tagJSON = tag
        },
        onError: function(error: any) {
          console.log(':(', error.type, error.info)
        }
      })

      this.dbClientQuery(
        'UPDATE songs1 SET play_attempts = coalesce(songs1.play_attempts,0)+1 WHERE id = $1',
        [rows1[ind].id],
        res => {}
      )
    }
  }

  handleSongLoading = (p1: number, p2: number, p3: number) => {
    //console.log('onLoading:',p1,p2,p3)
  }

  handleSongLoad = (p1: any) => {
    // console.log('onLoad:',p1)
    this.setState({
      trackFullTime: this.millisToMinutesAndSeconds(p1.duration)
    })
  }

  handleOnLoad = () => {
    this.setState({
      loaded: true,
      duration: this.secondsToMinutesAndSeconds(this.player.duration())
    })
    var analyser = window.Howler.ctx.createAnalyser()
    // Размерность преобразования Фурье
    // Если не понимаете, что это такое - ставьте 512, 1024 или 2048 ;)
    analyser.fftSize = 2048
    // Создаем массивы для хранения данных
    let fFrequencyData = new Float32Array(analyser.frequencyBinCount)
    let bFrequencyData = new Uint8Array(analyser.frequencyBinCount)
    let bTimeData = new Uint8Array(analyser.frequencyBinCount)
    // Получаем данные
    analyser.getFloatFrequencyData(fFrequencyData)
    analyser.getByteFrequencyData(bFrequencyData)
    analyser.getByteTimeDomainData(bTimeData)

    console.log('onLoad:',fFrequencyData,bFrequencyData,bTimeData)
  }

  handleSongPlaying = (p1: any) => {
    // console.log('onPlaying:',p1.position,p1.duration)
    this.setState({
      trackCurrentTime: this.millisToMinutesAndSeconds(p1.position)
    })
  }

  handleAudioProcess = (ws: any) => {
    // console.log(ws.wavesurfer.getCurrentTime(),ws.wavesurfer.getDuration())
    appState.currentTime = this.secondsToMinutesAndSeconds(
      ws.wavesurfer.getCurrentTime()
    )
    //    this.setState({ trackCurrentTime: this.secondsToMinutesAndSeconds(ws.wavesurfer.getCurrentTime()) })
    //  this.setState({ trackFullTime: this.secondsToMinutesAndSeconds(ws.wavesurfer.getDuration()) })
    //  this.setState({ trackCurrentTime: '2' })
  }

  onReadyWs = (ws: any) => {
    this.setState({
      trackFullTime: this.secondsToMinutesAndSeconds(
        ws.wavesurfer.getDuration()
      )
    })
  }

  handleFinishedPlaying = () => {
    //console.log('STOP!');
    let ind = this.state.currentTrackIndex
    let nextInd: number =
      this.state.currentTrackIndex == this.state.rows.length - 1
        ? 0
        : this.state.currentTrackIndex + 1

    let rows1 = this.state.rows.slice()
    rows1[ind].played_times += 1
    rows1[nextInd].play_attempts += 1

    this.setState({
      currentTrackIndex: nextInd,
      rows: rows1,
      cName: 'file://' + this.state.rows[nextInd].path
    })

    this.dbClientQuery(
      'UPDATE songs1 SET played_times = coalesce(songs1.played_times,0)+1 WHERE id = $1',
      [rows1[ind].id],
      res => {}
    )
    this.dbClientQuery(
      'UPDATE songs1 SET play_attempts = coalesce(songs1.play_attempts,0)+1 WHERE id = $1',
      [rows1[nextInd].id],
      res => {}
    )
  }

  millisToMinutesAndSeconds = (millis: number): string => {
    let minutes = Math.floor(millis / 60000)
    let seconds: number = (millis % 60000) / 1000
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds.toFixed(0)
  }

  secondsToMinutesAndSeconds = (millis: number): string => {
    let minutes = Math.floor(millis / 60)
    let seconds: number = (millis % 60) / 1
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds.toFixed(0)
  }

  // handleSubmit = (user: any) => {
  //   //    console.log('submit user', user)
  //
  //   this.dbClientQuery("SELECT * FROM songs1 WHERE path ILIKE $1 ORDER BY path ASC",
  //     ['%' + user.firstName + '%'], (res) => {
  //       this.setState({ dbQueryResult: res });
  //       this.setState({
  //         currentTrackIndex: undefined,
  //         rows: res.rows,
  //         soundStatus: Sound.status.STOPPED
  //       })
  //     })
  // }

  searchOnChange = (evt: any) => {
    this.setState({ searchStr: evt.target.value })
  }

  searchOnSubmit = (evt: any) => {
    evt.preventDefault()

    let qStr = 'SELECT * FROM songs1 WHERE path ILIKE $1'
    let qParms = ['%' + this.state.searchStr + '%']

    if (!this.state.showAttempted) {
      qStr += ' AND play_attempts IS NULL'
    } else {
      if (!this.state.showPlayed) {
        qStr += ' AND played_times IS NULL'
      }
    }
    qStr += ' ORDER BY path ASC'

    this.dbClientQuery(qStr, qParms, res => {
      // this.setState({ dbQueryResult: res });
      this.setState({
        currentTrackIndex: undefined,
        rows: res.rows
        //soundStatus: Sound.status.STOPPED
      })
    })
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    })
  }

  render() {
    const timelineOptions = {
      timeInterval: 0.5,
      height: 30
      // primaryFontColor: '#ff0000',
      // primaryColor: '#00ff00'
    }
    const minimapOptions = {
      height: 30,
      waveColor: '#ddd',
      progressColor: '#999',
      cursorColor: '#999'
    }

    // <TimerView appState={appState} />
    // if(this.state.rows){
    // let rf=this.state.rows.filter(x=>x.play_attempts!=null)
    // console.log(rf)}

    return (
      <div>
        {/*<WebAudioPlayer />*/}
        <TimeView appState={appState} />

        <label>
          Audio Library
          <select
            name="audioLib"
            value={this.state.audioLib}
            onChange={this.handleInputChange}
          >
            <option value="audioManager">AudioManager</option>
            <option value="wavesurfer">Wavesurfer</option>
            <option value="howler">Howler</option>
          </select>
        </label>

        {/* <Demo /> */}
        <form onSubmit={this.searchOnSubmit}>
          <input
            type="text"
            value={this.state.searchStr}
            onChange={this.searchOnChange}
          />&nbsp;
          <label>
            Show attempted<input
              name="showAttempted"
              type="checkbox"
              checked={this.state.showAttempted}
              onChange={this.handleInputChange}
            />
          </label>&nbsp;
          <label>
            Show played<input
              name="showPlayed"
              type="checkbox"
              checked={this.state.showPlayed}
              onChange={this.handleInputChange}
            />
          </label>
        </form>

        <div>
          {this.state && this.state.cName ? (
            <div>Now playing {this.state.cName}</div>
          ) : (
            'No Sound'
          )}
          {this.state && this.state.trackFullTime ? (
            <div style={{ display: 'flex' }}>
              {/*<TimeView appState={appState} /> &nbsp; of &nbsp;*/}
              {this.state.trackFullTime}
            </div>
          ) : null}
          {this.state && this.state.duration ? (
            <div style={{ display: 'flex' }}>
              {/*<TimeView appState={appState} /> &nbsp; of &nbsp;*/}
              {this.state.duration}
            </div>
          ) : null}
          {this.props.search}
          {this.props.soundLib}
        </div>

        {this.state && this.state.cName ? (
          <div>
            {this.state.audioLib == 'howler' ? (
              <ReactHowler
                src={[this.state.cName]}
                playing={this.state.playing}
                onLoad={this.handleOnLoad}
                onEnd={this.handleFinishedPlaying}
                ref={ref => (this.player = ref)}
              />
            ) : null}
            {this.state.audioLib == 'wavesurfer' ? (
              <Wavesurfer
                audioFile={this.state.cName}
                pos={0}
                options={{
                  splitChannels: true,
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
            ) : null}
            {/*url={this.state.cName}
            playStatus={this.state.soundStatus}
            // playFromPosition={
              300 /* in milliseconds * /}
              onLoading={this.handleSongLoading}
              onLoad={this.handleSongLoad}
              onPlaying={this.handleSongPlaying}
              onFinishedPlaying={this.handleFinishedPlaying}
            /> */}*/}
          </div>
        ) : (
          'No Sound'
        )}

        <div
          style={{
            border: '1px solid #ff0000',
            overflow: 'scroll',
            height: '80vh'
          }}
        >
          {this.state && this.state.rows
            ? this.state.rows
                // .filter(
                //   x => (this.state.showAttempted ? true : !x.play_attempts)
                // )
                .slice(0, 750)
                .map((
                  x,
                  k //<div>key={k}{k}</div>)
                ) => (
                  <SoundTrackLine
                    selected={k == this.state.currentTrackIndex}
                    ind={k}
                    key={k}
                    rawData={x}
                    callBack={this.setTrack}
                  />
                ))
            : 'No List'}
        </div>
      </div>
    )
  }
}

export default SoundTrackList
