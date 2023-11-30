import React from "react";
// import { Typography } from "@mui/material";
import { HashRouter as Router, Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

/**
 * Define UserDetail, a React component of CS142 Project 5.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: {} };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    let userId = this.props.match.params.userId;
    // Async call to server
    axios.get(`/user/${userId}`)
      .then((response) => {
        let user = response.data;
        this.setState({ user: user });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  render() {
    return (
      <Router>
        <div className="user-detail">
          <div className="user-header">
            <h1>
              {this.state.user.first_name + " " + this.state.user.last_name}
            </h1>
          </div>

          <div className="user-info">
            <div className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-content">{this.state.user.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Occupation:</span>
              <span className="info-content">{this.state.user.occupation}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Description:</span>
              <span className="info-content">
                {this.state.user.description}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Photos:</span>
              <span className="info-content">
                <Link to={"/photos/" + this.state.user._id}>
                  <button type="button">View Photos</button>
                </Link>
              </span>
            </div>
          </div>
        </div>
      </Router>

      // <Typography variant="body1">
      //   This should be the UserDetail view of the PhotoShare app. Since it is
      //   invoked from React Router the params from the route will be in property
      //   match. So this should show details of user:
      //   {this.props.match.params.userId}. You can fetch the model for the user
      //   from window.cs142models.userModel(userId).
      // </Typography>
    );
  }
}

export default UserDetail;
