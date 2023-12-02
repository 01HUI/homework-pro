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

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();

const fs = require("fs");
// 导入所需的模块和依赖项
const session = require("express-session"); // 用于管理会话的Express会话中间件
const bodyParser = require("body-parser"); // 用于处理HTTP POST请求体的Body解析中间件
const multer = require("multer"); // 用于处理multipart/form-data的Multer中间件，用于文件上传

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js"); // 从指定文件导入User模式
const Photo = require("./schema/photo.js"); // 从指定文件导入Photo模式
const SchemaInfo = require("./schema/schemaInfo.js"); // 从指定文件导入SchemaInfo模式

// const { appendFileSync } = require("fs");

// 配置Multer以处理文件上传并将它们存储在内存中
const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

// 配置Express应用程序以使用必要的中间件

// 使用选项配置会话中间件
app.use(
  session({
    secret: "secretKey", // 用于签署会话ID cookie的密钥
    resave: false, // 如果会话数据未修改，则不保存会话数据
    saveUninitialized: false, // 在存储之前不要创建会话
  })
);

// 使用bodyParser中间件解析JSON请求
app.use(bodyParser.json());
// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const cs142models = require("./modelData/photoApp.js").cs142models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

function getSessionUserID(request) {
  console.log("6569f6f175ebed489de3b273===>", request.session.user_id);
  return request.session.user_id;
  //return session.user._id;
}

function hasNoUserSession(request, response) {
  //return false;
  if (!getSessionUserID(request)) {
    response.status(401).send();
    return true;
  }
  if (session.user === undefined) {
    response.status(401).send();
    return true;
  }
  return false;
}

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

app.post("/photos/new", function (request, response) {
  if (hasNoUserSession(request, response)) return;
  const user_id = getSessionUserID(request) || "";
  if (user_id === "") {
    console.error("Error in /photos/new", user_id);
    response.status(400).send("user_id required");
    return;
  }
  processFormBody(request, response, function (error) {
    if (error || !request.file) {
      console.error("Error in /photos/new", error);
      response.status(400).send("photo required");
      return;
    }
    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;
    fs.writeFile("./images/" + filename, request.file.buffer, function (e) {
      if (e) {
        console.error("Error in /photos/new");
        response.status(400).send("error writing photo");
        return;
      }
      Photo.create({
        _id: new mongoose.Types.ObjectId(),
        file_name: filename,
        date_time: new Date(),
        user_id: new mongoose.Types.ObjectId(user_id),
        comment: [],
      })
        .then(() => {
          response.end();
        })
        .catch((err) => {
          console.error("Error in /photos/new", err);
          response.status(500).send(JSON.stringify(err));
        });
    });
  });
});

app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (hasNoUserSession(request, response)) return;
  const id = request.params.photo_id || "";
  const user_id = getSessionUserID(request) || "";
  const comment = request.body.comment || "";
  if (id === "") {
    response.status(400).send("id required");
    return;
  }
  if (user_id === "") {
    response.status(400).send("user_id required");
    return;
  }
  if (comment === "") {
    response.status(400).send("comment required");
    return;
  }
  Photo.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $push: {
        comments: {
          comment: comment,
          date_time: new Date(),
          user_id: new mongoose.Types.ObjectId(user_id),
          _id: new mongoose.Types.ObjectId(),
        },
      },
    },
    function (err) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /commentsOfPhoto/:photo_id", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      response.end();
    }
  );
});

// 登录接口
app.post("/admin/login", async (request, response) => {
  try {
    const { login_name, password } = request.body;

    // 查找用户
    const user = await User.findOne({ login_name });
    console.log("user", user);

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

// 获取用户列表
app.get("/user/list", async (request, response) => {
  try {
    // 查询数据库，获取所有用户
    const userList = await User.find(
      {},
      { _id: 1, first_name: 1, last_name: 1, login_name: 1 }
    );

    // 返回用户列表
    response.json(userList);
  } catch (error) {
    console.error("Error in /user/list", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 注销
app.post("/admin/logout", (req, res) => {
  // 销毁 session 中的用户信息
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      // 注销成功，返回空响应
      res.status(200).end();
    }
  });
});

// // /user/login-status 路由处理获取当前登录用户信息请求
// app.get("/user/login-status", (req, res) => {
//   // 检查 session 中是否有保存的用户信息
//   const user = req.session.user;
//   console.log("user===>", req.session);

//   if (user) {
//     res.json(user);
//   } else {
//     res.status(401).json({ error: "Unauthorized" });
//   }
// });

// ----------------------------------------------

/**
 * URL /user/:id - Returns the information for User (id).
 */
// 处理获取特定用户信息的HTTP GET请求
app.get("/user/:id", async function (request, response) {
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

app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;
  User.findOne(
    { _id: id },
    "_id first_name last_name location description occupation"
  )
    .then(function (user) {
      if (!user) {
        throw new Error("User not found");
      }
      return Photo.find(
        { user_id: id },
        "_id user_id comments file_name date_time"
      );
    })
    .then(function (photos) {
      const promises = photos.map(function (photo) {
        const commentsPromises = photo.comments.map(function (comment) {
          return User.findOne(
            { _id: comment.user_id },
            "_id first_name last_name"
          )
            .then(function (user) {
              return {
                _id: comment.id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: user,
              };
            })
            .catch(function (err) {
              console.error("Error retrieving comment user:", err);
              throw err;
            });
        });
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
      return Promise.all(promises);
    })
    .then(function (photosData) {
      response.status(200).send(photosData);
    })
    .catch(function (error) {
      console.error("An error occurred while retrieving user photos:", error);
      response
        .status(400)
        .send("An error occurred while retrieving user photos");
    });
});

const server = app.listen(3001, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
