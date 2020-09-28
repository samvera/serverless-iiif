const errorHandler = async (err, event, context, resource, callback) => {
  console.error(err);
  if (err.statusCode) {
    return await callback(null, {
      statusCode: err.statusCode,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    });
  } else if (err instanceof resource.errorClass) {
    return await callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: err.toString()
    });
  } else {
    return await callback(err, null);
  }
};

module.exports = {
  errorHandler: errorHandler
};
