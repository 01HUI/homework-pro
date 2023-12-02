import React from "react";
import { List, ListItem } from "@mui/material";
import { Link } from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData.js";
import axios from 'axios';
import "./styles.css";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    // 初始化组件状态
    this.state = {
      photos: [], // 存储用户照片
      advancedFeaturesEnabled: false, // 高级功能是否启用
      currentPhotoIndex: 0, // 当前照片索引
    };
    this.timer = null; // 自动照片切换的计时器
  }

  // 组件挂载后执行的函数
  componentDidMount() {
    this.fetchUserPhotos(); // 获取用户照片数据
  }

  // 当组件更新时执行的函数
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.advancedFeaturesEnabled !== this.state.advancedFeaturesEnabled
    ) {
      // 检查高级功能是否发生变化
      if (this.state.advancedFeaturesEnabled) {
        this.startAutoTransition(); // 如果启用，开始自动切换照片
      } else {
        this.stopAutoTransition(); // 如果禁用，停止自动切换照片
      }
    }
  }

  // 获取用户照片数据
  fetchUserPhotos = () => {
    const userId = this.props.match.params.userId; // 从路由参数中获取用户ID

    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        const photos = response.data; // 获取返回的照片数据
        this.setState({ photos }); // 更新组件状态中的照片数据
        // this.props.userChange(photos[0].owner); // 更新顶层组件状态中的用户数据
      })
      .catch((e) => {
        console.log(e); // 如果出现错误，打印错误信息
      });
  };

  // 切换高级功能的启用状态
  toggleAdvancedFeatures = () => {
    this.setState((prevState) => ({
      advancedFeaturesEnabled: !prevState.advancedFeaturesEnabled,
    }));
  };

  // 显示上一张照片
  goToPreviousPhoto = () => {
    this.setState((prevState) => ({
      currentPhotoIndex: Math.max(0, prevState.currentPhotoIndex - 1),
    }));
  };

  // 显示下一张照片
  goToNextPhoto = () => {
    this.setState((prevState) => ({
      currentPhotoIndex: Math.min(
        prevState.photos.length - 1,
        prevState.currentPhotoIndex + 1
      ),
    }));
  };

  // 开始自动照片切换
  startAutoTransition = () => {
    this.timer = setInterval(this.goToNextPhoto, 5000); // 每5秒切换一张照片
  };

  // 停止自动照片切换
  stopAutoTransition = () => {
    clearInterval(this.timer);
  };

  // 生成照片评论的单个条目
  photoCommentItem = (comment) => {
    const userId = this.props.someProperty || "" + comment.user._id; // 获取评论用户的ID

    return (
      <p className="card-text">
        <Link to={"/users/" + userId}>
          <span className="fw-bold comment-user">
            {comment.user.first_name + " " + comment.user.last_name + ": "}
          </span>
        </Link>
        <span className="comment-text">{comment.comment}</span>
        <span className="opacity-50 ms-3 comment-upload-time">
          (At: {comment.date_time})
        </span>
      </p>
    );
  };

  // 生成照片的评论列表
  photoComments = (comments) => {
    if (!comments) return <div></div>; // 如果没有评论，返回空的div

    return (
      <List component="div">
        {comments.map((comment) => (
          <ListItem divider={false} key={comment._id}>
            {this.photoCommentItem(comment)} {/* 生成单个评论条目 */}
          </ListItem>
        ))}
      </List>
    );
  };

  // 渲染照片查看器
  renderPhotoViewer = () => {
    const { photos, currentPhotoIndex } = this.state;
    const photo = photos[currentPhotoIndex]; // 获取当前显示的照片

    return (
      <div className="card user-photo-image">
        <img src={"images/" + photo.file_name} className="card-img-top" />
        <div className="card-body">
          <p className="card-title opacity-50 photo-upload-text">
            {photo.date_time}
          </p>
          {this.photoComments(photo.comments)} {/* 渲染照片的评论列表 */}
        </div>
      </div>
    );
  };

  render() {
    const { advancedFeaturesEnabled, currentPhotoIndex, photos } = this.state;

    if (advancedFeaturesEnabled) {
      return (
        <div>
          <div className="top-bar">
            <label>
              <input
                type="checkbox"
                checked={advancedFeaturesEnabled}
                onChange={this.toggleAdvancedFeatures}
              />
              启用高级功能
            </label>
          </div>
          {photos.length > 0 ? (
            <div>
              {this.renderPhotoViewer()} {/* 渲染照片查看器 */}
              <div>
                <button
                  onClick={this.goToPreviousPhoto}
                  disabled={currentPhotoIndex === 0}
                >
                  上一张
                </button>
                <button
                  onClick={this.goToNextPhoto}
                  disabled={currentPhotoIndex === photos.length - 1}
                >
                  下一张
                </button>
              </div>
            </div>
          ) : (
            <p>暂无照片。</p>
          )}
        </div>
      );
    } else {
      return (
        <div>
          <div className="top-bar">
            <label>
              <input
                type="checkbox"
                checked={advancedFeaturesEnabled}
                onChange={this.toggleAdvancedFeatures}
              />
              启用高级功能(自动轮播、点击切换)
            </label>
          </div>
          {photos.length > 0 ? (
            <List component="div">
              {photos.map((photo) => (
                <div key={photo._id} className="card user-photo-image">
                  <img
                    src={"images/" + photo.file_name}
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <p className="card-title opacity-50 photo-upload-text">
                      {photo.date_time}
                    </p>
                    {this.photoComments(photo.comments)}
                    {/* 渲染照片的评论列表 */}
                  </div>
                </div>
              ))}
            </List>
          ) : (
            <p>暂无照片。</p>
          )}
        </div>
      );
    }
  }
}

export default UserPhotos;
