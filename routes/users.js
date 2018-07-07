const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');

router.get('', async function(req, res, next) {
  try {
    const userData = await db.query('SELECT * FROM users');
    return res.json(userData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, email, photo) 
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [req.body.first_name, req.body.last_name, req.body.email, req.body.photo]
    );
    return res.json(newUser.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const found_user = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json(found_user.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
    const updatedUser = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, photo=$4 WHERE id=$5 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.params.id
      ]
    );
    return res.json(updatedUser.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    await db.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
