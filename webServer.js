/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

// 导入所需的模块和依赖项
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();

// 用于管理会话的Express会话中间件
const session = require("express-session");
// 用于处理HTTP POST请求体的Body解析中间件
const bodyParser = require("body-parser");
// 用于处理multipart/form-data的Multer中间件，用于文件上传
const multer = require("multer");
// 用于处理文件路径的Node.js模块
const path = require("path");
//用于将 Express 会话数据存储在 MongoDB 中的 connect-mongodb-session 模块
const MongoDBStore = require("connect-mongodb-session")(session);

// 配置 Multer 中间件，确保生成唯一的文件名
const storage = multer.diskStorage({
  destination: "./images",
  filename: (req, file, cb) => {
    // 生成唯一的文件名，确保文件名具有足够的随机性
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
// 使用 Multer 中间件创建一个 Multer 实例
const upload = multer({ storage });

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// 会话配置
// 创建一个 MongoDBStore 实例，用于将会话数据存储在 MongoDB 中
const store = new MongoDBStore({
  uri: "mongodb://127.0.0.1/cs142project6",
  // 在数据库中存储会话数据的集合名称
  collection: "sessions",
  // 设置会话的过期时间为一天
  expires: 1000 * 60 * 60 * 24,
});

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

// 该方式-会话配置时间较短
// app.use(
//   session({
//     // 用于签署会话ID cookie的密钥
//     secret: "your-secret-key",
//     // 如果会话数据未修改，则不保存会话数据
//     resave: false,
//     // 在存储之前不要创建会话
//     saveUninitialized: true,
//     // 将会话设置为1小时后过期:自动过期
//     cookie: { maxAge: 3600000 },
//   })
// );

// 使用bodyParser中间件解析JSON请求
app.use(bodyParser.json());

// 连接到MongoDB
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

// 中间件，确保除了登录、注册、注销以外的所有请求都需要用户身份验证
app.use((req, res, next) => {
  console.log("req.path===>", req.path);
  console.log("req.session.user===>", req.session.user);
  if (
    req.path !== "/admin/login" &&
    req.path !== "/admin/logout" &&
    req.path !== "/user"
  ) {
    if (!req.session.user) {
      res.status(401).send("Unauthorized: User not logged in");
      return;
    }
  }
  next();
});

// 登录接口
app.post("/admin/login", async (request, response) => {
  try {
    const { login_name, password } = request.body;

    // 查找用户
    const user = await User.findOne({ login_name });
    console.log("login user message===>", user);

    if (!user) {
      // 用户不存在
      return response.status(401).json({ error: "用户不存在,请注册后登录！" });
    }
    // 比较密码
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // 密码不匹配
      return response
        .status(401)
        .json({ type: "password", error: "密码不正确,请重新输入" });
    }

    // 登录成功，将用户信息存储在 session 中
    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      // 其他用户信息...
    };

    // 返回用户信息
    return response.json(request.session.user);
  } catch (error) {
    // 处理其他错误
    console.error("Error in /admin/login", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

// 注册接口
app.post("/user", async (req, res) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = req.body;

    // 检查 login_name 是否已存在
    const existingUser = await User.findOne({ login_name });

    if (existingUser) {
      return res.status(400).json({ error: "用户名已存在，请您重新注册" });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    // 将新用户保存到数据库
    await newUser.save();

    // 注册成功，将用户信息存储在 session 中
    req.session.user = {
      _id: newUser._id,
      first_name: newUser.first_name,
      // 其他用户信息...
    };

    // 响应用户数据（根据需要自定义响应）
    return res.status(200).json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      location: newUser.location,
      description: newUser.description,
      occupation: newUser.occupation,
      // 根据需要添加其他属性
    });
  } catch (error) {
    console.error("用户注册错误:", error);
    return res.status(500).json({ error: "内部服务器错误" });
  }
});

// 退出登录接口
app.post("/admin/logout", (req, res) => {
  // 检查用户是否已登录
  if (!req.session.user) {
    res.status(400).send("Bad Request: User not logged in");
    return;
  }

  // 销毁 session 中的用户信息
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // 退出成功，返回空响应
      res.status(200).end();
    }
  });
});

// 获取用户列表接口
app.get("/user/list", async (request, response) => {
  try {
    // 查询数据库，获取所有用户
    const userList = await User.find(
      {},
      { _id: 1, first_name: 1, last_name: 1, login_name: 1 }
    );

    // 返回用户列表
    return response.json(userList);
  } catch (error) {
    console.error("Error in /user/list", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

// 用户详情接口
app.get("/user/:id", async (request, response) => {
  try {
    // 检查用户会话是否有效，如果无效则立即返回
    // if (hasNoUserSession(request, response)) return;

    // 从请求参数中获取用户ID
    const id = request.params.id;

    // 查询数据库，排除一些敏感信息
    const user = await User.findById(id, {
      __v: 0,
      login_name: 0,
      password: 0,
    });

    // 如果未找到用户，记录错误并返回400 Bad Request响应
    if (!user) {
      console.error("User not found - /user/:id", id);
      response.status(400).send();
    }

    // 将用户信息以JSON格式返回给客户端
    response.json(user);
  } catch (err) {
    console.error("Error in /user/:id", err.reason);

    // 如果错误是BSONTypeError，返回400 Bad Request响应；否则，返回500 Internal Server Error响应
    if (err.reason.toString().startsWith("BSONTypeError:")) {
      response.status(400);
    } else {
      response.status(500);
    }

    // 发送响应
    response.send();
  }
});

// 获取用户照片列表接口
app.get("/photosOfUser/:id", async (request, response) => {
  // 从请求参数中获取用户的 ID
  const id = request.params.id;

  // 查找用户信息，仅返回指定字段
  User.findOne(
    { _id: id },
    "_id first_name last_name location description occupation"
  )
    .then(function (user) {
      // 如果找不到用户，抛出错误
      if (!user) {
        throw new Error("User not found");
      }

      // 查找用户的照片信息，仅返回指定字段
      return Photo.find(
        { user_id: id },
        "_id user_id comments file_name date_time"
      );
    })
    .then(function (photos) {
      // 遍历照片信息，处理每张照片的评论信息
      const promises = photos.map(function (photo) {
        // 处理每条评论信息
        const commentsPromises = photo.comments.map(function (comment) {
          return User.findOne(
            { _id: comment.user_id },
            "_id first_name last_name"
          )
            .then(function (user) {
              // 返回格式化后的评论数据，包含评论用户信息
              return {
                _id: comment.id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: user,
              };
            })
            .catch(function (err) {
              // 处理查询评论用户时的错误
              console.error("Error retrieving comment user:", err);
              throw err;
            });
        });

        // 等待所有评论处理完成后，返回格式化后的照片信息
        return Promise.all(commentsPromises).then(function (commentsData) {
          return {
            _id: photo._id,
            user_id: photo.user_id,
            comments: commentsData,
            file_name: photo.file_name,
            date_time: photo.date_time,
          };
        });
      });

      // 等待所有照片信息处理完成后，返回格式化后的所有照片数据
      return Promise.all(promises);
    })
    .then(function (photosData) {
      // 成功时，返回状态码 200 和格式化后的照片数据
      response.status(200).send(photosData);
    })
    .catch(function (error) {
      // 处理任何错误，并返回状态码 400 和错误消息
      console.error("An error occurred while retrieving user photos:", error);
      response
        .status(400)
        .send("An error occurred while retrieving user photos");
    });
});

// 添加评论接口
app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;
  console.log("request.session.user_id===>", req.session.user._id);
  const user_id = req.session.user._id;

  try {
    // 检查评论是否为空
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ error: "评论不能为空" });
    }

    // 查找相应的照片
    const photo = await Photo.findById(photo_id);

    if (!photo) {
      return res.status(404).json({ error: "找不到相应的照片" });
    }

    // 创建评论
    const newComment = {
      comment,
      user_id,
      date_time: Date.now(),
    };

    // 将评论添加到照片的comments数组中
    photo.comments.push(newComment);

    // 保存更新后的照片
    await photo.save();

    // 返回成功响应
    return res.status(200).json({ success: true, message: "评论添加成功" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "服务器错误" });
  }
});

// 上传照片接口
app.post("/photos/new", upload.single("photo"), async (req, res) => {
  try {
    // 检查请求中是否包含文件
    if (!req.file) {
      // 如果没有文件，返回 400 错误和错误消息
      return res.status(400).json({ error: "错误请求：POST 请求中没有文件" });
    }

    // 获取当前已登录用户的用户 ID
    const user_id = req.session.user._id;

    // 创建新的 Photo 文档，包括文件名、用户 ID 和初始的评论数组
    const photo = await Photo.create({
      file_name: req.file.filename,
      user_id: user_id,
      comments: [],
    });

    // 返回成功的响应，包含成功消息和上传的照片信息
    return res.status(200).json({ message: "照片上传成功", photo: photo });
  } catch (error) {
    // 捕获可能的错误，返回 500 错误和错误消息
    console.error("上传照片时出错：", error);
    return res.status(500).json({ error: "内部服务器错误" });
  }
});

// 启动服务器
const server = app.listen(3001, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
