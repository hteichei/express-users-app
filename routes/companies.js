const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');

router.get('', async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies');
    return res.json(companyData.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const newCompany = await db.query(
      'INSERT INTO companies (name, logo) VALUES ($1, $2) RETURNING *',
      [req.body.name, req.body.logo]
    );
    return res.json(newCompany.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies');
    const employees = await db.query(
      'SELECT * FROM users WHERE current_company_id=$1',
      [req.params.id]
    );
    const userIds = employees.rows.map(val => val.id);
    companyData.rows[0].users = userIds;
    return res.json(companyData.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    await db.query('DELETE FROM companies WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
    const found_company = await db.query(
      'UPDATE companies SET name=$1, logo=$2 WHERE id=$3 RETURNING *',
      [req.body.name, req.body.logo, req.params.id]
    );
    return res.json(found_company.rows[0]);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
