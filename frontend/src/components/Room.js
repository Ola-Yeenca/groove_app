import React, { Component } from "react";
import { Link } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import {
  Typography,
  Alert,
  Button,
  ButtonGroup,
  Grid,
} from "@mui/material";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      settings: false,
      spotifyAuthenticated: false,
    };
    this.roomCode = this.props.match.params.roomCode;
    this.ExitButtonPressed = this.ExitButtonPressed.bind(this);
    this.getRoomdetails = this.getRoomdetails.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomdetails = this.getRoomdetails(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getRoomdetails();
  }

  componentDidMount() {
    this.getRoomdetails();
  }


  async getRoomdetails() {
    try {
      const response = await fetch('/api/get-room' + '?code=' + this.roomCode);
      if (!response.ok) {
        this.props.leaveRoomCallBack();
        this.props.history.push('/');
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


  ExitButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/api/exit-room', requestOptions).then((_response) => {
      this.props.leaveRoomCallBack();
      this.props.history.push('/');
    });
  }


  updateSettings(value) {
    const requestOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.roomCode,
      }),
    };
    fetch('/api/update-room', requestOptions).then((_response) => {
      this.setState({ settings: value, });
    });
    if (this.state.isHost) {
      this.authenticateSpotify()
    }
  }

  authenticateSpotify () {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch('/spotify/is-authenticated', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        console.log(data.status);
        if (!data.status) {
          fetch('/spotify/get-auth-url')
          .then((response) => response.json)
          .then((data) => {
            window.location.replace(data.url);
          })
        }
      })
    }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" variant="contained" onClick={() => this.updateSettings(true)}>
            Settings
          </Button>
        </ButtonGroup>
      </Grid>
    );
  }


  renderSettings () {
    return (
    <Grid container spacing={1}>
      <Grid items xs={12} align="center">
        <CreateRoomPage
          update={true}
          votesToSkip={this.state.votesToSkip}
          guestCanPause={this.state.guestCanPause}
          roomCode={this.roomCode}
          updateCallBack={this.getRoomdetails}
        />
        </Grid>
        <Grid items xs={12} align="center">
          <Button color="secondary" variant="contained" onClick={() => this.updateSettings(false)}>
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }



  render() {
    if (this.state.settings) {
      return this.renderSettings();
    }
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes: {this.state.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guest Can Pause: {this.state.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Host: {this.state.isHost.toString()}
          </Typography>
        </Grid>

        {this.state.isHost ? this.renderSettingsButton() : null}

        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" onClick={ this.ExitButtonPressed } style={{ margin: '10px' }}>
            Exit Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
