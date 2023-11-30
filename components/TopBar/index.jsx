import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import axios from 'axios';
import "./styles.css";

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { version: "" };
  }

  componentDidMount() {
    // Async call to server
    // 通过接口获取数据：version版本号
    axios.get("/test/info")
      .then((response) => {
        let version = response.data.__v;
        this.setState({ version: version });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            Photo Application (version {this.state.version})
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
