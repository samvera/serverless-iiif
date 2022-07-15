const errorHandler = async (err, _event, _context, resource) => {
  if (err.statusCode) {
    return {
      statusCode: err.statusCode,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    };
  } else if (err instanceof resource.errorClass) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: err.toString()
    };
  } else {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text.plain' },
      body: err.toString()
    };
  }
};

module.exports = { errorHandler };
