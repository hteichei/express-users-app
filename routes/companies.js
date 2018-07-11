const express = require('express');
//add mergeParams when part of route is undefined in this file
const router = express.Router({ mergeParams: true });
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { ensureLoggedIn, ensureCorrectCompany } = require('../middleware/auth');
const { validate } = require('jsonschema');
const companiesSchema = require('../validation_schemas/companies_schema');

router.get('', ensureLoggedIn, async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies');
    delete companyData.rows[0].password;
    return res.json(companyData.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const result = validate(req.body, companiesSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newCompany = await db.query(
      'INSERT INTO companies (name, logo, handle, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.body.name, req.body.logo, req.body.handle, hashedPassword]
    );
    delete newCompany.rows[0].password;
    return res.json(newCompany.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies');
    const users = await db.query(
      'SELECT * FROM users WHERE current_company_id=$1',
      [req.params.id]
    );
    const jobs = await db.query('SELECT * FROM jobs WHERE company_id=$1', [
      req.params.id
    ]);
    delete companyData.rows[0].password;
    companyData.rows[0].users = users.rows;
    companyData.rows[0].jobs = jobs.rows;
    return res.json(companyData.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectCompany, async function(req, res, next) {
  try {
    await db.query('DELETE FROM companies WHERE id=$1', [req.params.id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', ensureCorrectCompany, async function(req, res, next) {
  try {
    const result = validate(req.body, companiesSchema);
    if (!result.valid) {
      // pass the validation errors to the error handler
      return next(result.errors.map(e => e.stack));
    }
    const found_company = await db.query(
      'UPDATE companies SET name=$1, logo=$2, handle=$2 WHERE id=$3 RETURNING *',
      [req.body.name, req.body.logo, req.body.handle, req.params.id]
    );
    return res.json(found_company.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  const foundCompany = await db.query('SELECT * FROM companies WHERE name=$1', [
    req.body.name
  ]);
  if (foundCompany.rows.length === 0) {
    return res.json({ message: 'Invalid Name' });
  }
  const result = await bcrypt.compare(
    req.body.password,
    foundCompany.rows[0].password
  );
  if (result === false) {
    return res.json({ message: 'Invalid Password' });
  } else {
    const token = jsonwebtoken.sign(
      {
        company_id: foundCompany.rows[0].id,
        hello: `hello ${foundCompany.rows[0].name}`
      },
      'superSecret'
    );
    return res.json({ token });
  }
});

module.exports = router;
