const jwt = require('jsonwebtoken');

const HttpError = require('./http-error');

const auth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {

    // res.locals.user=rek.params.id
    //const hello= req.headers
    console.log(req.headers.authorization, "token")
    const token = req.headers.authorization.split(" ")[0];

    console.log(token, "token")
    // Authorization: 'Bearer TOKEN'
    //const token=req.body.token;

    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    res.locals.userData = "hello"
    next();
  } catch (err) {
    const error = new HttpError('Authentication failedf!', 401);
    return next(error);
  }
};
exports.auth = auth;
