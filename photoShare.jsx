import React from "react";
import ReactDOM from "react-dom";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
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
      user: null, // 记录已登录的用户
    };
  }

  // 处理用户登录后更新状态的函数
  userChange = (user) => {
    console.log("Main Content user1111===>", user);

    this.setState({ user });
  };

  render() {
    const { user } = this.state;
    console.log("Main Content user===>", user);

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar user={user} userChange={this.userChange} />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            {/* 用户未登录,全部内部路由转到登录注册 */}
            {/* {!user && <LoginRegister userChange={this.userChange} />} */}
            {user && (
              <Grid item sm={3}>
                {user && (
                  <Paper className="cs142-main-grid-item">
                    {user && <UserList />}
                  </Paper>
                )}
              </Grid>
            )}
            <Grid item sm={user ? 9 : 12}>
              <Paper
                className="cs142-main-grid-item"
                style={{
                  boxShadow: "none",
                }}
              >
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => {
                      return user ? (
                        <Redirect to={`/users/${user._id}`} />
                      ) : (
                        <LoginRegister userChange={this.userChange} />
                      );
                    }}
                  />

                  <Route
                    path="/login-register"
                    render={(props) => (
                      <LoginRegister {...props} changeUser={this.changeUser} />
                    )}
                  />

                  <Route
                    path="/users/:userId"
                    render={(props) => {
                      return user ? (
                        <UserDetail {...props} userChange={this.userChange} />
                      ) : (
                        <LoginRegister userChange={this.userChange} />
                      );
                    }}
                  />
                  <Route
                    path="/photos/:userId"
                    render={(props) => {
                      return user ? (
                        <UserPhotos {...props} userChange={this.userChange} />
                      ) : (
                        <LoginRegister userChange={this.userChange} />
                      );
                    }}
                  />
                  <Route
                    path="/users"
                    // component={user ? LoginRegister : UserList}
                    render={(props) => {
                      return user ? (
                        <UserPhotos {...props} />
                      ) : (
                        <LoginRegister userChange={this.userChange} />
                      );
                    }}
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
