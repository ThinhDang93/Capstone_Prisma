function ok(res, data, message = "Success") {
  return res.status(200).json({ statusCode: 200, message, data });
}

function created(res, data, message = "Created") {
  return res.status(201).json({ statusCode: 201, message, data });
}

function fail(res, statusCode, message) {
  return res.status(statusCode).json({ statusCode, message, data: null });
}

module.exports = { ok, created, fail };
