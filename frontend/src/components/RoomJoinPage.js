import React, { Component } from "react";
import { Link } from "react-router-dom"
import {
  Typography,
  Alert,
  Button,
  TextField,
  Grid,
} from "@mui/material";



export default class RoomJoinPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      error: "",
    };
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.roomButtonPressed = this.roomButtonPressed.bind(this);
  }

  handleTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value,
    });
  }

  roomButtonPressed() {
    fetch("/api/join-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: this.state.roomCode,
      }),
    })
      .then((response) => {
        if (response.ok) {
          this.props.history.push(`/room/${this.state.roomCode}`);
        } else {
          this.setState({
            error: "Room not found.",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Grid container spacing={1} class='join-room' style={{padding: '60px'}}>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            Join a Room
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <TextField
            error={this.state.error}
            label="Code"
            placeholder="Enter a Room Code"
            value={this.state.roomCode}
            helperText={this.state.error}
            variant="outlined"
            onChange={this.handleTextFieldChange}
          />
        </Grid>
        <Grid item xs={12} align='center' style={{ padding: '30px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.roomButtonPressed}
            style={{ marginRight: '10px' }}
          >
            Enter Room
          </Button>
          <Button
            color="secondary"
            variant="contained"
            to="/"
            component={Link}
            style={{ marginLeft: '10px' }}
          >
            Home
          </Button>
        </Grid>
      </Grid>
    );
  }
}
