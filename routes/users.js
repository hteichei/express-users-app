const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { validate } = require('jsonschema');
const usersSchema = require('../validation_schemas/users_schema');

router.get('', ensureLoggedIn, async function(req, res, next) {
  try {
    const userData = await db.query('SELECT * FROM users');
    return res.json(userData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const result = validate(req.body, usersSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, email, photo, username, password, current_company_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.body.username,
        hashedPassword,
        req.body.current_company_id
      ]
    );
    delete newUser.rows[0].password;
    return res.json(newUser.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const found_user = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json(found_user.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const result = validate(req.body, usersSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const updatedUser = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, photo=$4, password=$5, current_company_id=$6 WHERE id=$7 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        hashedPassword,
        req.body.current_company_id,
        req.params.id
      ]
    );
    return res.json(updatedUser.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectUser, async function(req, res, next) {
  try {
    await db.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  const foundUser = await db.query('SELECT * FROM users WHERE username=$1', [
    req.body.username
  ]);
  if (foundUser.rows.length === 0) {
    return res.json({ message: 'Invalid Username' });
  }
  const result = await bcrypt.compare(
    req.body.password,
    foundUser.rows[0].password
  );
  if (result === false) {
    return res.json({ message: 'Invalid Password' });
  } else {
    const token = jsonwebtoken.sign(
      {
        user_id: foundUser.rows[0].id,
        hello: `hello ${foundUser.rows[0].username}`
      },
      'superSecret'
    );
    return res.json({ token });
  }
});

module.exports = router;
