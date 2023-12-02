import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { fieldConfigs } from "./userConfig.ts";

class LoginRegister extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // 用户登录信息
      user: {
        id: "",
        login_name: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        occupation: "",
        location: "",
        description: "",
      },
      // 是否登录
      loggedIn: false,
      // 是否需要显示注册表单
      needRegister: false,
      // tip
      message: null,
      // 提示可见性
      snackbarOpen: false,
      flag: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  // 用户登录
  handleLogin = async () => {
    console.log(
      "login_name===>",
      this.state.user.login_name,
      this.state.password
    );
    const { login_name, password } = this.state.user;

    // 字段校验
    if (login_name === "" || password === "") {
      this.setState({
        message: "用户名或密码不能为空",
        snackbarOpen: true,
      });
      return;
    }
    try {
      const response = await axios.post("/admin/login", {
        login_name,
        password,
      });
      console.log("response.data._id===>", response.data._id);

      if (response && response.data) {
        this.setState({
          // 更新用户id
          user: { id: response.data._id },
          loggedIn: true,
        });

        // 更新用户状态到外部组件，切换toolbar视图
        this.props.userChange(response.data);
      }

      // 错误处理
    } catch (error) {
      console.error("登录过程中发生错误:", error);
      // 在这里处理状态码为 401 的情况
      if (error.response && error.response.status === 401) {
        const errorData = error.response.data;
        this.setState({
          message: errorData.error,
          snackbarOpen: true,
          // 401:用户未登录，需要先注册
          // 密码错误,不需要跳转
          needRegister: errorData.type !== "password" && true,
        });
      } else {
        // 处理其他错误
        this.setState({ message: "登录时发生错误", snackbarOpen: true });
      }
    }
  };

  // 用户注册
  handleRegister = async () => {
    const {
      login_name,
      password,
      confirmPassword,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = this.state.user;

    // 检查必填字段是否填写
    const requiredFields = fieldConfigs.filter((field) => field.required);

    if (requiredFields.some((field) => this.state.user[field.key] === "")) {
      this.setState({
        message: "请检查必填字段是否填写",
        snackbarOpen: true,
      });
      return;
    }

    // 检查密码是否匹配
    if (password !== confirmPassword) {
      this.setState({
        message: "密码不匹配,请您重新输入",
        snackbarOpen: true,
      });
      return;
    }

    try {
      const response = await axios.post("/user", {
        login_name,
        password,
        first_name,
        last_name,
        location,
        description,
        occupation,
      });

      if (response && response.data) {
        this.setState({
          id: response.data._id,
          loggedIn: true,
          needRegister: false,
          message: "注册成功",
        });

        this.props.userChange(response.data);
      }
    } catch (error) {
      console.error("注册过程中发生错误:", error);

      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        console.log("errorData===>", errorData.error);
        this.setState({
          message: errorData.error,
          snackbarOpen: true,
          // 400:用户名已被注册过
          needRegister: true,
        });
      } else {
        this.setState({
          message: "注册时发生错误,请稍后再试",
          snackbarOpen: true,
          needRegister: true,
        });
      }
    }
  };

  // 更新用户信息
  handleChange(e, key) {
    this.setState({ user: { ...this.state.user, [key]: e.target.value } });
  }

  // 跳转注册
  handleRegistrationButtonClick = () => {
    this.setState({ needRegister: true, flag: true });
  };

  // 获取表单元素
  getTextField = (configArr) => {
    return configArr.map((config) => (
      <TextField
        key={config.key}
        variant="outlined"
        margin="normal"
        required={config.required}
        fullWidth
        name={config.key}
        label={config.label}
        type={config.key}
        id={config.key}
        autoFocus={config.autoFocus}
        autoComplete={config.autoComplete || config.key}
        value={this.state.user[config.key]}
        onChange={(e) => this.handleChange(e, config.key)}
      />
    ));
  };

  render() {
    const { loggedIn, message, snackbarOpen, id, needRegister, flag } =
      this.state;

    console.log("message===>", loggedIn, id);

    // 登录成功跳转用户详情页;
    if (loggedIn) {
      return <Link to={`/users/${id}`} />;
    }

    const getTip = () => {
      return (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackbarOpen}
          autoHideDuration={1800}
          onClose={() => {
            // 在 Snackbar 关闭时设置 needRegister 为 true
            this.setState({ flag: needRegister, snackbarOpen: false });
          }}
          message={message}
        />
      );
    };

    // 注册模块
    if (flag) {
      return (
        <Grid
          container
          style={{
            minHeight: "80vh",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Grid item xs={12} sm={8} md={4} lg={3} component={Paper} square>
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar style={{ backgroundColor: "#1976d2", margin: "10px" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                注册
              </Typography>
              {/* 注册表单 */}
              {this.getTextField(fieldConfigs)}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                style={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  marginTop: "20px",
                }}
                onClick={this.handleRegister}
              >
                注册
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => this.setState({ needRegister: false, flag: false })}
                style={{ marginTop: "20px" }}
              >
                已有账号？去登录
              </Button>
              {getTip()}
            </div>
          </Grid>
        </Grid>
      );
    }
    // 登录模块
    return (
      <Grid
        container
        style={{
          minHeight: "100vh",
          alignItems: "flex-start",
          justifyContent: "center",
          marginTop: "50px",
        }}
      >
        <Grid
          item
          xs={12}
          sm={8}
          md={4}
          lg={3}
          component={Paper}
          elevation={6}
          square
        >
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar style={{ backgroundColor: "#1976d2", margin: "10px" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              登录
            </Typography>
            {/* 登录表单 */}
            {this.getTextField(fieldConfigs.slice(0, 2))}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              style={{
                backgroundColor: "#1976d2",
                color: "#fff",
                marginTop: "20px",
              }}
              onClick={this.handleLogin}
            >
              登录
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => this.setState({ needRegister: true, flag: true })}
              style={{ marginTop: "20px" }}
            >
              还没有账号？注册一个
            </Button>

            {getTip()}
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default LoginRegister;
