import React, { Component } from "react";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
    };
    this.roomCode = this.props.match.params.roomCode;
  }

  componentDidMount() {
    this.getRoomdetails();
  }


  async getRoomdetails() {
    try {
      const response = await fetch('/api/get-room' + '?code=' + this.roomCode);
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      const data = await response.json();
      this.setState({
        votesToSkip: data.votes_to_skip,
        guestCanPause: data.guest_can_pause,
        isHost: data.is_host,
      });
    } catch (error) {
      console.error(error);
    }
  }



  render() {
    return (
      <div>
        <h3>{this.roomCode}</h3>
        <p>Votes: {this.state.votesToSkip}</p>
        <p>Guest Can Pause: {this.state.guestCanPause.toString()}</p>
        <p>Host: {this.state.isHost.toString()}</p>
      </div>
    );
  }
}