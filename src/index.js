/*
 * IMPLEMENTATION NOTE: API Gateway Lambda functions have a 
 * ~6MB payload limit. See LAMBDA_LIMIT.md for implications
 * and a workaround.
 */

const AWS = require('aws-sdk');
const IIIF = require('iiif-processor');
const middy = require('middy');
const { cors, httpHeaderNormalizer } = require('middy/middlewares');

const handleRequest = (event, context, callback) => {
  try {
    new IIIFLambda(event, context, callback, process.env.tiffBucket)
      .processRequest();
  } catch (err) {
    callback(err, null);
  }
};

class IIIFLambda {

  constructor (event, context, callback, sourceBucket) {
    this.event = event;
    this.context = context;
    this.respond = callback;
    this.sourceBucket = sourceBucket;
    this.initResource();
  }

  directResponse (result) {
    var base64 = /^image\//.test(result.contentType);
    var content = base64 ? result.body.toString('base64') : result.body;
    var response = {
      statusCode: 200,
      headers: { 
        'Content-Type': result.contentType,
        'Access-Control-Allow-Origin': '*'
       },
      isBase64Encoded: base64,
      body: content
    };
    this.respond(null, response);
  }

  handleError (err, resource) {
    if (err.statusCode) {
      this.respond(null, {
        statusCode: err.statusCode,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Not Found'
      });
    } else if (err instanceof this.resource.errorClass) {
      this.respond(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: err.toString()
      });
    } else {
      this.respond(err, null);
    }
  }

  initResource () {
    var scheme = this.event.headers['X-Forwarded-Proto'] || 'http';
    var host = this.event.headers['Host'];
    var path = this.event.path;
    if (!/\.(jpg|tif|gif|png|json)$/.test(path)) {
      this.redirectToInfoJSON = true;
    }
    if (process.env.include_stage) {
      path = '/' + this.event.requestContext.stage + path;
    }
    var uri = `${scheme}://${host}${path}`;

    this.resource = new IIIF.Processor(uri, id => this.s3Object(id));
  }

  processRequest () {
    AWS.config.region = this.context.invokedFunctionArn.match(/^arn:aws:lambda:(\w+-\w+-\d+):/)[1];

    if (this.event.httpMethod === 'OPTIONS') {
      this.respond(null, { statusCode: 204, body: null });
    } else if (this.redirectToInfoJSON) {
      this.respond(null, {
        statusCode: 302,
        headers: {
          Location: this.event.path + '/info.json',
        }});
    } else {
      this.resource.execute()
        .then(result => this.directResponse(result))
        .catch(err => this.handleError(err));
    }
  }

  s3Object (id) {
    var s3 = new AWS.S3();
    return s3.getObject({
      Bucket: this.sourceBucket,
      Key: `${id}.tif`
    }).createReadStream();
  }
}

module.exports = {
  handler: middy(handleRequest)
    .use(httpHeaderNormalizer())
    .use(cors())
};
