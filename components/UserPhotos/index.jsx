import React from "react";
import {
  List,
  ListItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    // 初始化组件状态
    this.state = {
      user_id: "",
      photos: [], // 存储用户照片
      advancedFeaturesEnabled: false, // 高级功能是否启用
      currentPhotoIndex: 0, // 当前照片索引
      openDialog: false, // 是否打开对话框
      commentText: "", // 评论文本
      message: "", // 消息提示
      snackbarOpen: false, // 提示可见性
      current_photo_id: "",
    };
    this.timer = null; // 自动照片切换的计时器
  }

  // 组件挂载后执行的函数
  componentDidMount() {
    const new_user_id = this.props.match.params.userId;
    this.fetchUserPhotos(new_user_id); // 获取用户照片数据
  }

  // 当组件更新时执行的函数
  componentDidUpdate(prevProps, prevState) {
    const new_user_id = this.props.match.params.userId;
    const current_user_id = this.state.user_id;
    if (new_user_id && current_user_id && current_user_id !== new_user_id) {
      this.fetchUserPhotos(new_user_id);
    }

    if (
      prevState.advancedFeaturesEnabled !== this.state.advancedFeaturesEnabled
    ) {
      // 检查高级功能是否发生变化
      if (this.state.advancedFeaturesEnabled) {
        // 如果启用，开始自动切换照片
        this.startAutoTransition();
      } else {
        // 如果禁用，停止自动切换照片
        this.stopAutoTransition();
      }
    }
  }

  // 获取用户照片数据
  fetchUserPhotos = async (new_user_id) => {
    // 从路由参数中获取用户ID
    const userId = new_user_id || "";
    try {
      // 获取用户信息
      const response = await axios.get(`/photosOfUser/${userId}`);
      if (response.data) {
        // 获取返回的照片数据
        const photos = response.data;
        // 更新组件状态
        this.setState({ photos, user_id: userId });
      }
    } catch (error) {
      console.error("获取照片过程中发生错误:", error);

      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        this.setState({ message: errorData.error, snackbarOpen: true });
      } else {
        this.setState({
          message: "获取照片发生错误,请稍后再试",
          snackbarOpen: true,
        });
      }
    }
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

  // 更新评论文本
  handleCommentTextChange = (event) => {
    this.setState({ commentText: event.target.value });
  };

  // 打开对话框
  handleOpenDialog = (event) => {
    const photo_id = event.target.getAttribute("photo_id");
    this.setState({ openDialog: true, current_photo_id: photo_id });
  };

  // 关闭对话框
  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  // 添加评论
  handleAddComment = async (photoId) => {
    const { commentText, user_id } = this.state;

    try {
      const response = await axios.post(`/commentsOfPhoto/${photoId}`, {
        comment: commentText,
      });

      if (response.status === 200) {
        // 评论添加成功后，重新获取用户照片数据
        await this.fetchUserPhotos(user_id);
        this.setState({ message: "评论添加成功!", snackbarOpen: true });
      } else {
        // 评论添加失败
        this.setState({
          message: "评论添加失败,请稍后再试!",
          snackbarOpen: true,
        });
      }
    } catch (error) {
      console.error("添加评论过程中发生错误:", error);

      this.setState({
        message: "添加评论发生错误,请稍后再试",
        snackbarOpen: true,
      });
    }

    this.handleCloseDialog();
  };

  // 添加评论视图
  addPhotoViewer = () => {
    // 从组件状态中获取 openDialog 和 commentText
    const { openDialog, commentText, current_photo_id } = this.state;

    return (
      <>
        {/* 评论框的对话框 */}
        <Dialog
          open={openDialog}
          onClose={() => {
            this.handleCloseDialog();
          }}
          // 设置对话框宽度为全宽度
          fullWidth
          // 可选项，可以根据需要调整最大宽度
          maxWidth="md"
        >
          <DialogTitle
            style={{
              paddingBottom: "40px",
            }}
          >
            添加评论
          </DialogTitle>
          <DialogContent
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 评论输入框 */}
            <TextField
              label="评论"
              multiline
              rows={4}
              variant="outlined"
              value={commentText}
              onChange={this.handleCommentTextChange}
            />
            {/* 提交评论的按钮 */}
            <Button
              onClick={() => {
                this.handleAddComment(current_photo_id);
              }}
            >
              提交评论
            </Button>
            {/* 关闭评论框的按钮 */}
            <Button
              onClick={() => {
                this.handleCloseDialog();
              }}
            >
              关闭
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // 生成照片评论的单个条目
  photoCommentItem = (comment) => {
    // 获取评论用户的ID
    const userId = this.props.someProperty || "" + comment.user._id;

    return (
      <p className="card-text">
        <Link to={"/users/" + userId}>
          <span className="fw-bold comment-user">
            {comment.user.last_name + " " + comment.user.first_name + ": "}
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
    // 如果没有评论，返回空的div
    if (!comments) return <div></div>;

    return (
      <List component="div">
        {comments.map((comment) => (
          <ListItem divider={false} key={comment._id}>
            {/* 生成单个评论条目 */}
            {this.photoCommentItem(comment)}
          </ListItem>
        ))}
      </List>
    );
  };

  // 渲染照片查看器
  renderPhotoViewer = () => {
    const { photos, currentPhotoIndex } = this.state;
    // 获取当前显示的照片
    const photo = photos[currentPhotoIndex];

    return (
      <div className="card user-photo-image">
        <img src={"images/" + photo.file_name} className="card-img-top" />
        <div className="card-body">
          <div className="card-title opacity-50 photo-upload-text">
            <span>Uploaded at:{photo.date_time}</span>
          </div>
          {/* 渲染照片的评论列表 */}
          {this.photoComments(photo.comments)}
        </div>
      </div>
    );
  };

  render() {
    const {
      advancedFeaturesEnabled,
      currentPhotoIndex,
      photos,
      snackbarOpen,
      message,
    } = this.state;

    if (advancedFeaturesEnabled) {
      return (
        <div>
          {/* 高级功能开启按钮 */}
          {photos.length > 0 && (
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
          )}
          {/* 照片 */}
          {photos.length > 0 ? (
            <div>
              {/* 渲染照片查看器 */}
              {this.renderPhotoViewer()}
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
            <p>该用户暂无上传的照片</p>
          )}
        </div>
      );
    } else {
      return (
        <div>
          {photos.length > 0 && (
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
          )}
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
                    {/* 打开评论框的按钮 */}
                    <Button
                      photo_id={photo._id}
                      onClick={(event) => {
                        this.handleOpenDialog(event);
                      }}
                    >
                      添加评论
                    </Button>
                    <div>{this.addPhotoViewer()}</div>
                    {/* 渲染照片的评论列表 */}
                    {this.photoComments(photo.comments)}
                  </div>
                </div>
              ))}
            </List>
          ) : (
            <p>该用户暂无上传的照片</p>
          )}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={snackbarOpen}
            autoHideDuration={1800}
            onClose={() => {
              this.setState({ snackbarOpen: false });
            }}
            message={message}
          />
        </div>
      );
    }
  }
}

export default UserPhotos;
