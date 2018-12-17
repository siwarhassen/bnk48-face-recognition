import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Webcam from 'react-webcam';
import { getFullFaceDescription, createMatcher } from '../api/face';
import DrawBox from './drawBox';

const bnk48JSON = require('../descriptors/bnk48.json');
const WIDTH = 480;
const HEIGHT = 480;

class CameraFaceDetect extends Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.state = {
      fullDesc: null,
      faceMatcher: null,
      facingMode: 'user',
      inputDeviceVideo: 0
    };
  }

  componentWillMount() {
    //let mode = this.props.location.state;
    // if (mode === 'back')
    //   this.setState({ facingMode: { exact: 'environment' } });
    this.setInputDevice();
    this.matcher();
  }

  setInputDevice = async () => {
    let inputDevice = [];
    await navigator.mediaDevices
      .enumerateDevices()
      .then(
        devices =>
          (inputDevice = devices.filter(device => device.kind === 'videoinput'))
      );
    // if (inputDevice.length > 1) {
    //   await this.setState({
    //     inputDeviceVideo: inputDevice.length,
    //     facingMode: { exact: 'environment' }
    //   });
    // }
    await this.setState({
      inputDeviceVideo: inputDevice.length,
      facingMode: inputDevice.length > 1 ? { exact: 'environment' } : 'user'
    });
    this.interval = setInterval(() => {
      this.capture();
    }, 1000);
  };

  matcher = async () => {
    const faceMatcher = await createMatcher(bnk48JSON);
    this.setState({ faceMatcher });
  };

  // componentDidMount() {
  //   // set interval capture image from webcam every 1000ms
  //   this.interval = setInterval(() => {
  //     this.capture();
  //   }, 1000);
  // }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  capture = async () => {
    if (!!this.webcam.current) {
      await getFullFaceDescription(this.webcam.current.getScreenshot()).then(
        fullDesc => this.setState({ fullDesc })
      );
    }
  };

  render() {
    const { fullDesc, faceMatcher, facingMode, inputDeviceVideo } = this.state;
    const videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
      facingMode: facingMode
    };

    return (
      <div
        className="Camera"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <p>Number of Camera: {inputDeviceVideo}</p>
        <div style={{ width: WIDTH, height: HEIGHT }}>
          <div style={{ position: 'relative', width: WIDTH }}>
            <div style={{ position: 'absolute' }}>
              <Webcam
                audio={false}
                width={WIDTH}
                height={HEIGHT}
                ref={this.webcam}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            </div>
            {!!fullDesc ? (
              <DrawBox
                fullDesc={fullDesc}
                faceMatcher={faceMatcher}
                imageWidth={WIDTH}
                boxColor={'blue'}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(CameraFaceDetect);