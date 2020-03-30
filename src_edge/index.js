'use strict';
 
module.exports.viewerRequest = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const host = request.headers["host"][0].value;
  
  request.headers["x-forwarded-host"] = [{
    key: "X-Forwarded-Host",
    value: host
  }];
  callback(null, request);
};
