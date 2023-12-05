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
import { Link } from "@mui/icons-material";

/**
 * Define TopBar, a React component of CS142 Project 5.
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef(); // 创建一个 ref 用于访问 input 元素
    this.state = {
      version: "",
      message: "",
      snackbarOpen: false,
    };
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

  // 用户退出登录
  handleLogout = async () => {
    try {
      const response = await axios.post("/admin/logout");

      if (response.status === 200) {
        // 注销成功
        this.setState({
          message: "用户已退出登录",
          snackbarOpen: true,
        });
        // 清除 localStorage 中的用户信息
        localStorage.removeItem("userData");
        this.props.userChange(undefined);
      } else {
        // 注销失败，处理错误
        const errorData = response.data;
        this.setState({
          message: errorData.message,
          snackbarOpen: true,
        });
      }
    } catch (error) {
      console.error("注销过程中发生错误:", error);
      // 错误提示
      this.setState({
        message: "注销时发生错误",
        snackbarOpen: true,
      });
    }
  };

  // 处理文件选择的事件
  handleFileChange = () => {
    const file = this.fileInputRef.current.files[0];
    this.uploadPhoto(file); // 在文件选择后立即触发上传
  };

  // 处理文件选择的事件
  handleButtonClick = () => {
    this.fileInputRef.current.click(); // 手动触发 input 元素的点击事件
  };

  // 照片上传
  uploadPhoto = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append("photo", file);

      try {
        const response = await axios.post("/photos/new", formData);
        this.setState({ message: response.data.message, snackbarOpen: true });
        <Link to={`/photos/${response.data.user_id}`} />;
      } catch (error) {
        console.error("上传照片时出错：", error);
        this.setState({ message: "上传照片失败", snackbarOpen: true });
      }
    } else {
      this.setState({ message: "未选择文件", snackbarOpen: true });
    }
  };

  render() {
    const { loginUser, loggedIn } = this.props;

    console.log("loginUser===>", loginUser, loggedIn);
    const { snackbarOpen, message } = this.state;
    const storedUserData = localStorage.getItem("userData") || {
      loginUser: { id: "", first_name: "" },
    };

    console.log("topbar storedUserData===>", storedUserData.user);

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
                Photo Application (version {this.state.version})
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box
                textAlign="right"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                {/* 未登录-请登录提示 */}
                {!loggedIn && (
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
                {/* 欢迎语 */}
                {loggedIn && (
                  <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
                    Welcome {loginUser.first_name || ""} ~
                  </Typography>
                )}
                {/* 照片上传 */}
                {loggedIn && (
                  <div className="upload">
                    {/* 隐藏的文件选择输入 */}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={this.fileInputRef}
                      onChange={this.handleFileChange}
                    />
                    {/* 显示的按钮 */}
                    <Button
                      variant="contained"
                      className="button"
                      style={{ backgroundColor: "#67cba8" }}
                      onClick={this.handleButtonClick}
                    >
                      Add Photos
                    </Button>
                  </div>
                )}
                {/* 注销 */}
                {loggedIn && (
                  <Button
                    variant="contained"
                    className="logoutButton"
                    style={{ backgroundColor: "#f27787" }}
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
