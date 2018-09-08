import React, { Component } from 'react'

class WebAudioPlayer extends Component {
  state = { externalData: null,loading:false }

  loadSoundFile = url => {
    this.xhr = new XMLHttpRequest()
    this.xhr.open('GET', url, true)
    this.xhr.responseType = 'arraybuffer' // важно
    this.xhr.onload = e => {
      this.setState({ dataLoaded: true, binData: this.xhr.response })
      // this.contextA.decodeAudioData(this.state.binData, this.playPcm)
      this.contextA.decodeAudioData(this.xhr.response, this.playPcm)
      this.setState({ externalData: 33,loading:false })
    }
    this.xhr.send()
  }

  playBuffer(decodedArrayBuffer) {
    // получаем декодированный буфер
    console.log('this in decodeAudioData/playBuffer', this.context)

    this.buffer = decodedArrayBuffer

    this.play()

    var analyser = this.context.createAnalyser()
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
    // дальше у Вас есть массивы fFrequencyData, bFrequencyData, bTimeData, с которыми можно делать все, что вздумается
  }
  // function(e) {
  //   console.log("Error decoding file", e);
  // }

  playPcm = pcmBuffer => {
    console.log('pcmBufferAudData', pcmBuffer.getChannelData(1).length)
    // подключаем буфер к источнику
    this.source = this.contextA.createBufferSource()

    let an = this

    this.source.connect(an.analyser)
    this.source.connect(an.contextA.destination)

    this.source.buffer = pcmBuffer

    // воспроизводим
    this.source.start(0)
  }

  // функция остановки воспроизведения
  stop = () => {
    this.source.stop(0)
  }

  // static getDerivedStateFromProps(nextProps, prevState){
  //   console.log('getDerivedStateFromProps(nextProps, prevState)',nextProps,prevState)
  //   if(!prevState || (nextProps.fileName !== prevState.fileName)){
  //   this.loadSoundFile(
  //     nextProps.fileName
  //     // 'file:///media/460G/v/mus/tracker/Nazareth - Ultimate Bootleg Collection By Purpleshade/1990, 1990.05.13 Dunfermline, Scotland/06. Morning Dew.mp3'
  //   )
  //   this.setState({fileName:nextProps.fileName})
  // }
  // }

  static getDerivedStateFromProps(props, state) {
    if (state && props.fileName !== state.fileName) {
      console.log('gDSFP new')
      return {
        externalData: null,
        fileName: props.fileName
      }
    }
    // No state update necessary
    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state && this.state.externalData === null) {
      if(!this.state.loading){
      console.log('cDU, new file', this.state)
      this.stop()
      this.loadSoundFile(this.props.fileName)
      this.setState({loading:true})
    }
      // this._loadAsyncData(this.props.id);
    }
  }

  componentDidMount = () => {
    console.log('WebAudioPlayer3: cDM')
    this.contextA = new window.AudioContext() //

    this.node = this.contextA.createScriptProcessor(2048, 1, 1)
    //Создаем анализатор
    this.analyser = this.contextA.createAnalyser()
    this.analyser.smoothingTimeConstant = 0.3
    this.analyser.fftSize = 512
    this.bands = new Uint8Array(this.analyser.frequencyBinCount)

    this.source = this.contextA.createBufferSource()

    let an = this

    this.source.connect(an.analyser)
    //связываем анализатор с интерфейсом, из которого он будет получать данные
    an.analyser.connect(an.node)
    //Связываем все с выходом
    an.node.connect(an.contextA.destination)
    this.source.connect(an.contextA.destination)
    //подписываемся на событие изменения входных данных
    an.node.onaudioprocess = () => {
      an.analyser.getByteFrequencyData(an.bands)
      let dv = an.bands
      let dvu = dv.map(x => {
        y: x
      })
      this.props.cbSetData(an.bands)
      //console.log('audio!',an.bands)
    }
    // дефолтный получатель звука
    // let destination = this.contextA.destination
    // // подключаем источник к получателю
    // this.source.connect(destination)


    if (this.state && this.state.externalData === null) {
      this.setState({externalData:44})
      this.loadSoundFile(this.props.fileName)
      // this._loadAsyncData(this.props.id);
    }
  }

  render = () => {
    // console.log('r,this', this)
    if (this.state && this.state.dataLoaded) {
      // console.log(this.state)
      // this.contextA.decodeAudioData(this.state.binData, this.playPcm)
    }
    return (
      <div>
        WebAudioPlayer{this.state && this.state.dataLoaded
          ? 'dataLoaded'
          : 'no data'}
      </div>
    )
  }
}

export default WebAudioPlayer
