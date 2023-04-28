import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Alert,
  FormControl,
  FormHelperText,
  InputLabel,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Box
} from "@mui/material";




export default class CreateRoomPage extends Component {
  defaultVotes = 3;

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: true,
      votesToSkip: this.defaultVotes,

    };
    this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
  }


  handleVotesChange(e) {
    this.setState({
      votesToSkip: e.target.value,
    });
  }

  handleGuestCanPauseChange(e) {
    this.setState({
      guestCanPause: e.target.value === "true",
    });
  }

  handleRoomButtonPressed() {
    console.log(this.state);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
      }),
    };
      console.log(requestOptions);
      fetch("/api/create-room", requestOptions)
        .then((response) => {
          console.log(response);
          if (!response.ok) {
            throw new Error('Failed to create room');
          }
          return response.json();
        })
        .then((data) => {
          if (!data.code) {
            throw new Error('Room code not found in response');
          }
          this.props.history.push("/room/" + data.code);
        })
        .catch((error) => {
          console.error('Error creating room:', error);
          // You can display an error message to the user here
          console.log(error);
          alert('Error creating room: ' + error);
        });
  }

  render() {
    return (
      <Grid container spacing={1} class='create-room' style={{padding: '60px'}} >
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            Create a Room Page
          </Typography>
          <Typography variant="subtitle1">
            Live, Laugh, Music...
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText>
              <div align="center">Guest Control of Playback State</div>
            </FormHelperText>
            <RadioGroup row defaultValue="true" onChange={this.handleGuestCanPauseChange}>
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play/Pause"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
          </Grid>
          <Grid item xs={12} align="center">
            <FormControl>
              <TextField
              required={true}
              type="number"
              defaultValue={this.defaultVotes}
              inputProps={{
                min: 1,
                style: { textAlign: "center" },
                }}
                onChange={this.handleVotesChange}
                />
              <FormHelperText>
                <div align="center">Votes Required to Skip Song</div>
              </FormHelperText>
            </FormControl>
            <Grid item xs={12} style={{padding: '30px'}}>
              <Button color="primary" variant="contained" onClick={this.handleRoomButtonPressed} >
                Create a Room
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button color="secondary" variant="contained" to="/" component={Link} >
                Back
              </Button>
            </Grid>
          </Grid>
      </Grid>
    );
  }
}
