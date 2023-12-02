import React from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import { HashRouter as Router, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    // 初始化组件状态
    this.state = { users: [], user_id: "" };
    // 绑定this
    // this.userFullName = this.userFullName.bind(this);
  }

  componentDidMount() {
    // Async call to server
    // 组件挂载后执行的生命周期方法
    // 服务器获取用户列表数据
    axios
      .get("/user/list")
      .then((response) => {
        console.log("User list response:", response.data);
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

  // 在组件更新后调用的生命周期方法
  componentDidUpdate() {
    // 获取新的用户 ID
    const new_user_id = this.props.match?.params.userId;

    // 获取当前组件状态中保存的用户 ID
    const current_user_id = this.state.user_id;

    // 检查用户 ID 是否发生变化
    if (current_user_id !== new_user_id) {
      // 如果发生变化，调用处理用户变化的方法
      this.handleUserChange(new_user_id);
    }
  }

  handleUserChange(user_id) {
    console.log("handleUserChange called with user_id:", user_id);
    this.setState({
      user_id: user_id,
    });
  }

  userListItems() {
    // 根据用户列表数据生成用户列表项
    return this.state.users.map((user) => (
      <ListItem divider={true} key={user._id}>
        <Link to={"/users/" + user._id} className="user-list-item">
          <ListItemText primary={user.first_name + " " + user.last_name} />
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
    );
  }
}

export default UserList;
