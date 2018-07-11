const jsonwebtoken = require('jsonwebtoken');

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization;
    const verifyToken = jsonwebtoken.verify(token, 'superSecret');
    return next();
  } catch (err) {
    return res.json({ message: 'Unauthorized' });
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const token = req.headers.authorization;
    const verifyToken = jsonwebtoken.verify(token, 'superSecret');
    if (verifyToken.user_id === +req.params.id) {
      return next();
    }
  } catch (err) {
    return res.json({ message: 'Unauthorized' });
  }
}

function ensureCorrectCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const verifyToken = jsonwebtoken.verify(token, 'superSecret');
    if (verifyToken.company_id === +req.params.id) {
      return next();
    }
  } catch (err) {
    return res.json({ message: 'Unauthorized' });
  }
}

function ensureCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const verifyToken = jsonwebtoken.verify(token, 'superSecret');
    if (verifyToken.company_id) {
      return next();
    }
  } catch (err) {
    return res.json({ message: 'Unauthorized' });
  }
}

module.exports = {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany,
  ensureCompany
};
