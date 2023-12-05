import React from "react";
// import { Typography } from "@mui/material";
import { HashRouter as Router, Link } from "react-router-dom";
import axios from "axios";
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
    // Async call to server
    const new_user_id = this.props.match.params.userId;
    this.handleUserChange(new_user_id);
  }

  componentDidUpdate() {
    const new_user_id = this.props.match.params.userId;
    const current_user_id = this.state.user?._id;
    if (current_user_id !== new_user_id) {
      this.handleUserChange(new_user_id);
    }
  }

  handleUserChange(user_id) {
    axios
      .get(`/user/${user_id}`)
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
              {this.state.user.last_name + " " + this.state.user.first_name}
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
    );
  }
}

export default UserDetail;
