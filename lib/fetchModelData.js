/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
// function fetchModel(url) {
//   return new Promise(function (resolve, reject) {
//     console.log(url);
//     setTimeout(() => reject(new Error(
//       { status: 501, statusText: "Not Implemented" })),
//       0
//     );
//     // On Success return:
//     // resolve({data: getResponseObject});
//   });
// }

function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    // 创建一个新的 XMLHttpRequest 对象
    let xhr = new XMLHttpRequest();
    // 打开一个到提供的 URL 的 GET 请求
    xhr.open("GET", url, true);

    // 定义 onload 事件处理程序
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 如果请求成功，尝试将响应解析为 JSON
        try {
          const responseObject = JSON.parse(xhr.responseText);
          // 使用解析后的响应对象解析 Promise
          resolve({ data: responseObject });
        } catch (error) {
          // 如果解析失败，拒绝带有错误信息的 Promise
          reject(new Error("解析响应时出错"));
        }
      } else {
        // 如果请求失败，使用状态和状态文本拒绝 Promise
        reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.statusText}`));
      }
    };

    // 定义 onerror 事件处理程序
    xhr.onerror = function () {
      // 如果存在网络错误，使用状态和状态文本拒绝 Promise
      reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.statusText}`));
    };

    // 发送 HTTP 请求
    xhr.send();
  });
}

export default fetchModel;
