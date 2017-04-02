const request = require('superagent');
const cryptagdPrefix = require('superagent-prefix')('http://localhost:7878/trusted');

const requestPost = function(urlSuffix, data){
  return new Promise((resolve, reject) => {
    request
      .post(urlSuffix)
      .use(cryptagdPrefix)
      .send(data)
      .end((err, res) => {
        let respErr = '';

        if (err) {
          if (typeof res === 'undefined') {
            respErr = err.toString();
          } else {
            // cryptagd's error format: {"error": "..."}
            respErr = res.body.error;
          }

          reject(respErr);
        }

        resolve(res);
      });
  });
}

export const reqPost = requestPost;
