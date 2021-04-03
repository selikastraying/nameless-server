const jwt = require('jsonwebtoken');

const secret = 'Seeking1998';

exports.getToken = (id) => jwt.sign({ id }, secret, { expiresIn: '1 day' });

exports.checkToken = (token) => jwt.verify(token, secret);
