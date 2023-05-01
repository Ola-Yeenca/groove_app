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
  Collapse,
  FormLabel,
  Grid,
  Paper,
  Box
} from "@mui/material";




export default class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallBack: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      errorMsg: "",
      successMsg: "",
    };
    this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
    this.renderCreateButtons = this.renderCreateButtons.bind(this);
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

  handleUpdateButtonPressed() {
    console.log(this.state);
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.props.roomCode,
      }),
    };
      console.log(requestOptions);
      fetch("/api/update-room", requestOptions).then((response) => {
        if (response.ok) {
          this.setState({
            successMsg: "Room updated successfully!",
          });
        } else {
          this.setState({
            errorMsg: "Error updating room...",
          });
        }
        this.props.updateCallback();
      });
  }

  renderCreateButtons() {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleRoomButtonPressed}
          >
            Create A Room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderUpdateButton() {
    return (
      <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleUpdateButtonPressed}
          >
            Update Room
          </Button>
        </Grid>
    )
  }

  render() {
    const title = this.props.update ? "Update Room" : "Create a Room";


    return (
      <Grid container spacing={1} class='create-room' style={{padding: '60px'}} >
        <Grid item xs={12} align="center">
        <Collapse
            in={this.state.errorMsg != "" || this.state.successMsg != ""}
          >
            {this.state.successMsg != "" ? (
              <Alert
                severity="success"
                onClose={() => {
                  this.setState({ successMsg: "" });
                }}
              >
                {this.state.successMsg}
              </Alert>
            ) : (
              <Alert
                severity="error"
                onClose={() => {
                  this.setState({ errorMsg: "" });
                }}
              >
                {this.state.errorMsg}
              </Alert>
            )}
          </Collapse>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {title}
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
            <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
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
              defaultValue={this.state.votesToSkip}
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
          </Grid>
          {this.props.update ? this.renderUpdateButton() : this.renderCreateButtons()}
      </Grid>
    );
  }
}
