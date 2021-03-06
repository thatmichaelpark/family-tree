/* eslint-disable camelcase */
'use strict';

const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const bcryptPromise = require('bcrypt-as-promised');
const knex = require('../knex');
const ev = require('express-validation');
const validations = require('../validations/users');

router.post('/users', ev(validations.post), (req, res, next) => {
  const user = req.body;

  knex('users')
  .select(knex.raw('1=1'))
  .where('email', user.email)
  .first()
  .then((exists) => {
    if (exists) {
      const err = new Error ('EMAIL ALREADY EXISTS');

      err.status = 409;
      throw err;
    }

    return bcryptPromise.hash(req.body.password, 12);
  })
  .then((hashed_password) =>
    knex('users')
    .insert({
      email: user.email,
      hashed_password
    })
  )
  .then(() => {
    res.sendStatus(200);
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
