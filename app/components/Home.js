// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import styles from './Home.css';
import SoundTrackList from './SoundTrackList'

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <div>
          <h2>Home</h2>
          <Link to="/counter">to Counter</Link>
          <SoundTrackList />
        </div>
      </div>
    );
  }
}
