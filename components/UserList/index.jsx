import React from "react";
import {
  // Divider,
  List,
  ListItem,
  ListItemText,
  // Typography,
} from "@mui/material";
import { HashRouter as Router, Link } from "react-router-dom";
import axios from 'axios';
// import fetchModel from "../../lib/fetchModelData.js";

import "./styles.css";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    // 初始化组件状态
    this.state = { users: [] };
    // 绑定this
    this.userFullName = this.userFullName.bind(this);
  }

  componentDidMount() {
    // Async call to server
    // 组件挂载后执行的生命周期方法
    // 异步从服务器获取用户列表数据
    axios.get("/user/list")
      .then((response) => {
        // 获取服务器返回的用户数据
        let users = response.data;
        // 更新组件状态中的用户列表数据
        this.setState({ users: users });
      })
      .catch((e) => {
        // 如果发生错误，打印错误信息到控制台
        console.log(e);
      });
  }

  userFullName(user) {
    // 返回用户的全名
    // 如果用户不存在，返回空字符串
    if (!user) return "";
    return (
      this.props.someProperty || "" + user.first_name + " " + user.last_name
    );
  }
  userListItems() {
    //for (let user of users) console.log(this.userFullName(user));
    // 根据用户列表数据生成用户列表项
    return this.state.users.map((user) => (
      <ListItem divider={true} key={user._id}>
        <Link to={"/users/" + user._id} className="user-list-item">
          <ListItemText primary={this.userFullName(user)} />
        </Link>
      </ListItem>
    ));
  }

  render() {
    return (
      <Router>
        {/* 渲染用户列表:左侧banner */}
        <h1>UserList</h1>
        <List component="nav">{this.userListItems()}</List>
      </Router>
      // <div>
      //   <Typography variant="body1">
      //     This is the user list, which takes up 3/12 of the window. You might
      //     choose to use <a href="https://mui.com/components/lists/">Lists</a>{" "}
      //     and <a href="https://mui.com/components/dividers/">Dividers</a> to
      //     display your users like so:
      //   </Typography>
      //   <List component="nav">
      //     <ListItem>
      //       <ListItemText primary="Item #1" />
      //     </ListItem>
      //     <Divider />
      //     <ListItem>
      //       <ListItemText primary="Item #2" />
      //     </ListItem>
      //     <Divider />
      //     <ListItem>
      //       <ListItemText primary="Item #3" />
      //     </ListItem>
      //     <Divider />
      //   </List>
      //   <Typography variant="body1">
      //     The model comes in from window.cs142models.userListModel()
      //   </Typography>
      // </div>
    );
  }
}

export default UserList;
