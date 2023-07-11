/* eslint-env jest */
const IIIF = require('iiif-processor');
const { handler } = require('../src/index');
const helpers = require('../src/helpers');
const { ResponseStream } = require('lambda-stream');

async function callHandler(handler, event, context) {
  const responseStream = new ResponseStream();
  const result = await handler(event, responseStream, context);
  expect(result.statusCode).toEqual(200);
  expect(result.headers['content-type']).toEqual('application/vnd.awslambda.http-integration-response');
  const payload = responseStream.getBufferedData().toString('UTF-8');
  const [prelude, body] = payload.split(/\u0000{8}/);
  return { ...JSON.parse(prelude), body };
}

describe("index.handler /iiif/3", () => {
  const context = {};

  beforeEach(() => {
    jest.mock("../src/helpers");
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    helpers.getRegion = jest.fn().mockImplementation(() => {
      return "AWS REGION";
    });

    helpers.eventPath = jest.fn().mockImplementation(() => "[EVENT PATH]");
  });

  it("responds to OPTIONS REQUEST", async () => {
    const event = {
      requestContext: {
        http: {
          method: "OPTIONS",
        },
      },
    };

    const expected = { statusCode: 204, body: "" };
    const result = await callHandler(handler, event, context);
    expect(result).toMatchObject(expected);
  });

  describe("INFO.JSON request", () => {
    beforeEach(() => {
      process.env.preflight = "true";
    });

    afterEach(() => {
      delete process.env.preflight;
    });

    it("responds to INFO.JSON REQUEST", async () => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);

      const event = {
        headers: {
          host: "iiif.example.edu",
          "x-preflight-dimensions": '{"width": 1280, "height": 720}',
        },
        requestContext: {
          http: {
            path: "/iiif/3/image_id/info.json",
          },
        },
      };

      const { body } = await callHandler(handler, event, context);
      const info = JSON.parse(body);
      expect(info["id"]).toEqual("http://iiif.example.edu/iiif/3/image_id");
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it("respects the x-forwarded-host header", async () => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);

      const event = {
        headers: {
          host: "handler.behind.proxy",
          "x-forwarded-host": "iiif.example.edu",
          "x-forwarded-proto": "https",
          "x-preflight-dimensions": '{"width": 1280, "height": 720}',
        },
        requestContext: {
          http: {
            path: "/iiif/3/image_id/info.json",
          },
        },
      };

      const { body } = await callHandler(handler, event, context);
      const info = JSON.parse(body);
      expect(info["id"]).toEqual("https://iiif.example.edu/iiif/3/image_id");
      expect(info.width).toEqual(1280);
      expect(info.height).toEqual(720);
      expect(info.sizes.length).toEqual(4);
    });

    it("redirects to INFO.JSON if filename missing", async () => {
      helpers.eventPath = jest
        .fn()
        .mockImplementationOnce(() => "/iiif/3/image_id");
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => true);

      const event = {};

      const expected = {
        statusCode: 302,
        headers: { Location: "/iiif/3/image_id/info.json" },
        body: "Redirecting to info.json",
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });
  });

  // IMAGE REQUEST
  describe("responds to IMAGE REQUEST", () => {
    const body = "[CONTENT BODY]";
    const event = {};
    beforeEach(() => {
      helpers.fileMissing = jest.fn().mockImplementationOnce(() => false);
      helpers.getUri = jest
        .fn()
        .mockImplementationOnce(
          () =>
            "https://iiif.example.edu/iiif/3/image_id/full/max/0/default.jpg"
        );
    });

    it("works with base64 image.", async () => {
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => true);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: "image_id",
          execute: async function () {
            return { body: Buffer.from(body) };
          },
        };
      });

      const expected = {
        statusCode: 200,
        isBase64Encoded: true,
        body: Buffer.from(body).toString("base64"),
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });

    it("works with nonbase64 image.", async () => {
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: "image_id",
          execute: async function () {
            return { body: body };
          },
        };
      });
      helpers.isBase64 = jest.fn().mockImplementationOnce(() => false);
      helpers.isTooLarge = jest.fn().mockImplementationOnce(() => false);

      const expected = {
        statusCode: 200,
        isBase64Encoded: false,
        body: body,
      };
      const result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });

    it("handles errors that arise during processing", async () => {
      IIIF.Processor = jest.fn().mockImplementationOnce(() => {
        return {
          id: "image_id",
          execute: async function () {
            throw new Error("ERROR");
          },
          errorClass: IIIF.Error,
        };
      });
      const expected = {
        body: "Error: ERROR",
        headers: {
          "Content-Type": "text.plain",
        },
        statusCode: 500,
      };
      result = await callHandler(handler, event, context);
      expect(result).toMatchObject(expected);
    });
  });
});
