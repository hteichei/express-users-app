const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');

router.get('', async function(req, res, next) {
  try {
    const jobData = await db.query('SELECT * FROM JOBS');
    return res.json(jobData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const newJob = await db.query(
      'INSERT INTO jobs (title, salary, equity, company_id) VALUES($1, $2, $3, $4) RETURNING *',
      [req.body.title, req.body.salary, req.body.equity, req.body.company_id]
    );
    return res.json(newJob.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const job = await db.query('SELECT * FROM JOBS WHERE id=$1', [
      req.params.id
    ]);
    return res.json(job.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
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

router.delete('/:id', async function(req, res, next) {
  try {
    await db.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
