import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import "./styles.css";
import PersonIcon from "@mui/icons-material/Person";

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { version: "", message: "", snackbarOpen: false };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    // Async call to server
    // 通过接口获取数据：version版本号
    axios
      .get("/test/info")
      .then((response) => {
        let version = response.data.__v;
        this.setState({ version: version });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  // 用户注销
  handleLogout = async () => {
    try {
      const response = await axios.post("/admin/logout");

      if (response.status === 200) {
        // 注销成功
        this.setState({
          message: "注销成功",
          snackbarOpen: true,
        });
        this.props.userChange(undefined);
      } else {
        // 注销失败，处理错误
        const errorData = response.data;
        this.setState({
          message: errorData.message,
          snackbarOpen: true,
        });
        // 通知外部视图切换UI
        this.props.userChange(undefined);
      }
    } catch (error) {
      console.error("注销过程中发生错误:", error);
      this.props.changeUser(undefined);
      // 错误提示
      this.setState({
        message: "注销时发生错误",
        snackbarOpen: true,
      });
    }
  };

  render() {
    const { user } = this.props;
    const { snackbarOpen, message } = this.state;

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container alignItems="center">
            <Grid item xs={8}>
              <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
                Photo Application (version {this.state.version})
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Box
                textAlign="right"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {!user && (
                  <Typography
                    variant="h6"
                    sx={{ marginRight: "8px" }}
                    style={{
                      color: "#ff1744",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                      fontWeight: "bold",
                      fontSize: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "24px",
                      }}
                    >
                      <PersonIcon
                        style={{
                          marginRight: "15px",
                          width: "30px",
                          height: "30px",
                        }}
                        color="warning"
                      />
                      Please Login
                    </div>
                  </Typography>
                )}

                {user && (
                  <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
                    Welcome {user && user?.first_name}
                  </Typography>
                )}

                {/* 注销 */}
                {user && (
                  <Button
                    variant="outlined"
                    style={{
                      backgroundColor: "#4285f4",
                      color: "#fff",
                    }}
                    onClick={this.handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={1000}
          onClose={() => {
            this.setState({ snackbarOpen: false });
          }}
          message={message}
        />
      </AppBar>
    );
  }
}

export default TopBar;
