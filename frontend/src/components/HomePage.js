import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";
import {
  Typography,
  Alert,
  Button,
  ButtonGroup,
  Grid,
} from "@mui/material";


export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch('/api/user-in-room')
      .then((response) => response.json())
      .then((data) => {
        const roomCode = data.code;
        if (roomCode) {
          this.setState({
            roomCode: roomCode
          });
        }
      });
  }

  renderHomePage() {
    return (
      <Grid container spacing={3} className='home-page' style={{padding: '60px'}}>
        <Grid item xs={12} align="center">
          <Typography component="h3" variant="h3">
            Groove Room
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" variant="contained" to="/join" component={Link} style={{margin: '10px'}}>
              Join a Room
            </Button>
            <Button color="secondary" variant="contained" to="/create" component={Link} style={{margin: '10px'}}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null
    });
  }

  render() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={
            this.state.roomCode ? (
              <Redirect to={`/room/${this.state.roomCode}`} />
            ) : (
              this.renderHomePage()
            )
          } />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/room/:roomCode"
          render={(props) => {
            return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
          }}
          />
        </Routes>
      </Router>
    );
  }
}
