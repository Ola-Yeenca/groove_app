import React, { Component } from "react";
import { Link } from "react-router-dom";
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
    };
    this.roomCode = this.props.match.params.roomCode;
    this.ExitButtonPressed = this.ExitButtonPressed.bind(this);
    this.getRoomdetails = this.getRoomdetails.bind(this);
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


  ExitButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/api/exit-room', requestOptions).then((_response) => {
      this.props.history.push('/');
    });
  }



  render() {
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
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" onClick={ this.ExitButtonPressed } style={{ margin: '10px' }}>
            Exit Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
