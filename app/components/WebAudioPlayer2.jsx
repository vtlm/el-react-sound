import React, { Component } from 'react'

class WebAudioPlayer extends Component {

  //context=null
  self=this
  // console.log('self',self)

  loadSoundFile = (url) => {

    console.log('this in loadSoundFile',this.context);

    // делаем XMLHttpRequest (AJAX) на сервер
    this.xhr = new XMLHttpRequest();
    this.xhr.open("GET", url, true);
    this.xhr.responseType = "arraybuffer"; // важно
    this.xhr.onload = (e) => {

      console.log('this in onLoadSoundFile',this);
       this.tstFunc(1)
       let tstFuncBind=this.tstFunc.bind(this)
      // tstFuncBind()
      //
      // let bounded=this.playBuffer.bind(this)
      // декодируем бинарный ответ
      this.context.decodeAudioData(
        // this.xhr.response).then(this.playBuffer.bind(this)
        this.xhr.response).then(tstFuncBind
      );




      // this.context.decodeAudioData(
      //   this.xhr.response,
      //   (decodedArrayBuffer) => {
      //     // получаем декодированный буфер
      //     console.log('this in decodeAudioData',this.context);
      //     this.buffer = decodedArrayBuffer;
      //
      //     this.play();
      //
      //     var analyser = this.context.createAnalyser();
      //     // Размерность преобразования Фурье
      //     // Если не понимаете, что это такое - ставьте 512, 1024 или 2048 ;)
      //     analyser.fftSize = 2048;
      //     // Создаем массивы для хранения данных
      //     let fFrequencyData = new Float32Array(analyser.frequencyBinCount);
      //     let bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
      //     let bTimeData = new Uint8Array(analyser.frequencyBinCount);
      //     // Получаем данные
      //     analyser.getFloatFrequencyData(fFrequencyData);
      //     analyser.getByteFrequencyData(bFrequencyData);
      //     analyser.getByteTimeDomainData(bTimeData);
      //     // дальше у Вас есть массивы fFrequencyData, bFrequencyData, bTimeData, с которыми можно делать все, что вздумается
      //
      //   },
      //   function(e) {
      //     console.log("Error decoding file", e);
      //   }
      // );
    };
    this.xhr.send();
  };

  playBuffer  (decodedArrayBuffer)  {
    // получаем декодированный буфер
    console.log('this in decodeAudioData/playBuffer',this.context);

    this.buffer = decodedArrayBuffer;

    this.play();

    var analyser = this.context.createAnalyser();
    // Размерность преобразования Фурье
    // Если не понимаете, что это такое - ставьте 512, 1024 или 2048 ;)
    analyser.fftSize = 2048;
    // Создаем массивы для хранения данных
    let fFrequencyData = new Float32Array(analyser.frequencyBinCount);
    let bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
    let bTimeData = new Uint8Array(analyser.frequencyBinCount);
    // Получаем данные
    analyser.getFloatFrequencyData(fFrequencyData);
    analyser.getByteFrequencyData(bFrequencyData);
    analyser.getByteTimeDomainData(bTimeData);
    // дальше у Вас есть массивы fFrequencyData, bFrequencyData, bTimeData, с которыми можно делать все, что вздумается

  }
  // function(e) {
  //   console.log("Error decoding file", e);
  // }
  tstFunc(i=77){
    console.log('tstFunc',i,this)
  }
  // функция начала воспроизведения
  play = () => {

    console.log('context in play:',this.context,self.context)

    // создаем источник
    source = this.context.createBufferSource();
    // подключаем буфер к источнику
    source.buffer = buffer;
    // дефолтный получатель звука
    destination = this.context.destination;
    // подключаем источник к получателю
    source.connect(destination);
    // воспроизводим
    source.start(0);
  };

  // функция остановки воспроизведения
  stop = () => {
    source.stop(0);
  };

  componentDidMount=()=> {
    // создаем аудио контекст
    this.context = new window.AudioContext(); //
    console.log('context after create',this.context)
    // переменные для буфера, источника и получателя
    this.buffer=null
    //, source, destination;

    console.log('this in DidMount',this.context);

    // функция для подгрузки файла в буфер

    this.loadSoundFile(
      "file:///media/460G/v/mus/rus/ZippO - Дискография/04. ZippO - Районный пазл (2017)/01. ZippO - Выжигаю мотив.mp3"
    );
  }
  render() {
    return <div>WebAudioPlayer</div>
  }
}

export default WebAudioPlayer
