const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');
const {
  ensureLoggedIn,
  ensureCorrectCompany,
  ensureCompany
} = require('../middleware/auth');
const { validate } = require('jsonschema');
const jobsSchema = require('../validation_schemas/jobs_schema');
const jsonwebtoken = require('jsonwebtoken');

router.get('', ensureLoggedIn, async function(req, res, next) {
  try {
    const jobData = await db.query('SELECT * FROM JOBS');
    return res.json(jobData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', ensureCompany, async function(req, res, next) {
  const token = req.headers.authorization;
  const verifyToken = jsonwebtoken.verify(token, 'superSecret');
  try {
    const result = validate(req.body, jobsSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const newJob = await db.query(
      'INSERT INTO jobs (title, salary, equity, company_id) VALUES($1, $2, $3, $4) RETURNING *',
      [req.body.title, req.body.salary, req.body.equity, verifyToken.company_id]
    );
    return res.json(newJob.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const job = await db.query('SELECT * FROM JOBS WHERE id=$1', [
      req.params.id
    ]);
    return res.json(job.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', ensureCorrectCompany, async function(req, res, next) {
  const token = req.headers.authorization;
  const verifyToken = jsonwebtoken.verify(token, 'superSecret');
  try {
    const result = validate(req.body, jobsSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const job = await db.query(
      'UPDATE jobs SET title=$1, salary=$2, equity=$3, company_id=$4 WHERE id=$5 RETURNING *',
      [
        req.body.title,
        req.body.salary,
        req.body.equity,
        req.body.company_id,
        req.params.id
      ]
    );
    return res.json(job.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectCompany, async function(req, res, next) {
  try {
    await db.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
