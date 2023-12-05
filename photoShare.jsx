import React from "react";
import ReactDOM from "react-dom";
import { Grid, Paper, Typography } from "@mui/material";
import {
  HashRouter,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
// 导入新的 LoginRegister 组件
import LoginRegister from "./components/LoginRegister";
import "./styles/main.css";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // 记录已登录的用户
      loginUser: {
        id: "",
        first_name: "",
      },
      loggedIn: false,
      currentPath: "",
    };
    this.userChange = this.userChange.bind(this);
  }

  componentDidMount() {
    const currentPath = window.location.href;
    this.setState({
      currentPath: currentPath,
    });

    // 检查 localStorage 中是否存在用户信息
    const storedUserData = localStorage.getItem("userData");

    console.log("storedUserData===>", storedUserData);

    if (storedUserData) {
      const userData = JSON.parse(storedUserData) || {
        loginUser: { id: "", first_name: "" },
      };

      if (userData.loginUser.id) {
        this.setState({
          loginUser: {
            id: userData.loginUser.id,
            first_name: userData.loginUser.first_name,
          },
          loggedIn: true,
        });
      }
    }
  }

  //  更新状态的函数
  userChange = (userData) => {
    console.log("userData===>", userData);
    if (userData === undefined) {
      this.setState({
        loginUser: {
          id: "",
          first_name: "",
        },
        loggedIn: false,
      });
    } else {
      this.setState(userData);
    }
  };

  render() {
    const { loginUser, loggedIn, currentPath } = this.state;
    console.log("Main Content user===>", loginUser, loggedIn, currentPath);
    // 刷新页面处理

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar
                loginUser={loginUser}
                userChange={this.userChange}
                loggedIn={loggedIn}
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            {loggedIn && (
              <Grid item sm={3}>
                {loggedIn && (
                  <Paper className="cs142-main-grid-item">
                    {loggedIn && (
                      <UserList
                        loginUser={loginUser}
                        userChange={this.userChange}
                      />
                    )}
                  </Paper>
                )}
              </Grid>
            )}
            <Grid item sm={loggedIn ? 9 : 12}>
              <Paper
                className="cs142-main-grid-item"
                style={{
                  boxShadow: "none",
                }}
              >
                <Switch>
                  {/* 右侧部分路由配置 */}
                  <Route
                    exact
                    path="/"
                    render={() => {
                      return loggedIn ? (
                        <Redirect to={`/users/${loginUser.id}`} />
                      ) : (
                        <LoginRegister userChange={this.userChange} />
                      );
                    }}
                  />

                  {/* 登录注册页 */}
                  {!loggedIn ? (
                    <Route
                      path="/login-register"
                      render={(props) => (
                        <LoginRegister
                          {...props}
                          userChange={this.userChange}
                        />
                      )}
                    />
                  ) : (
                    <Redirect
                      path="/login-register"
                      to={`/users/${loginUser.id}`}
                    />
                  )}

                  {/* 用户详情页 */}
                  {loggedIn ? (
                    <Route
                      path="/users/:userId"
                      render={(props) => (
                        <UserDetail {...props} userChange={this.userChange} />
                      )}
                    />
                  ) : (
                    <Redirect path="/users/:userId" to="/login-register" />
                  )}
                  {/* 用户详情-照片页 */}
                  {loggedIn ? (
                    <Route
                      path="/photos/:userId"
                      render={(props) => (
                        <UserPhotos
                          {...props}
                          userChange={this.userChange}
                          loginUser={loginUser}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/photos/:userId" to="/login-register" />
                  )}

                  {/*  路由容错处理，直接访问不存在的路由会重定向到 404 页面*/}
                  <Route
                    path="*"
                    render={() => (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          paddingTop: "50px",
                        }}
                      >
                        <Typography variant="h4" color="error">
                          404 Not Found - Page not found
                        </Typography>
                      </div>
                    )}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
