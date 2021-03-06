/* globals before:false */
/* globals beforeEach:false */
/* eslint-disable no-sync */
'use strict';

process.env.NODE_ENV = 'test';

const { suite, test } = require('mocha');
const bcrypt = require('bcrypt');
const request = require('supertest');
const knex = require('../knex');
const server = require('../server');

suite('routes session', () => {
  before((done) => {
    knex.migrate.latest()
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  beforeEach((done) => {
    knex('users')
      .del()
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test('POST /session', (done) => {
    const password = 'ilikebigcats';

    knex('users')
      .insert({
        email: 'john.siracusa@gmail.com',
        hashed_password: bcrypt.hashSync(password, 1)
      })
      .then(() => {
        request(server)
          .post('/session')
          .set('Content-Type', 'application/json')
          .send({
            email: 'john.siracusa@gmail.com',
            password
          })
          .expect('set-cookie', /family-tree-userId=2; Path=\//)
          .expect('set-cookie', /family_tree=[a-zA-Z0-9=]*; path=\//)
          .expect('set-cookie', /family_tree.sig=[a-zA-Z0-9=\-_]*; path=\//)
          .expect('Content-Type', /plain/)
          .expect(200, 'OK', done);
      })
      .catch((err) => {
        done(err);
      });
  });

  test('POST /session with bad email', (done) => {
    const password = 'ilikebigcats';

    knex('users')
      .insert({
        email: 'john.siracusa@gmail.com',
        hashed_password: bcrypt.hashSync(password, 1)
      })
      .then(() => {
        request(server)
          .post('/session')
          .set('Content-Type', 'application/json')
          .send({
            email: 'bad.email@gmail.com',
            password
          })
          .expect('Content-Type', /text/)
          .expect(401, 'Unauthorized', done);
      })
      .catch((err) => {
        done(err);
      });
  });

  test('POST /session with bad password', (done) => {
    knex('users')
      .insert({
        email: 'john.siracusa@gmail.com',
        hashed_password: bcrypt.hashSync('ilikebigcats', 1)
      })
      .then(() => {
        request(server)
          .post('/session')
          .set('Content-Type', 'application/json')
          .send({
            email: 'john.siracusa@gmail.com',
            password: 'badpassword'
          })
          .expect('Content-Type', /text/)
          .expect(401, 'Unauthorized', done);
      })
      .catch((err) => {
        done(err);
      });
  });

  test('DELETE /session', (done) => {
    request(server)
      .delete('/session')
      .expect('set-cookie', /family-tree-userId=; Path=\//)
      .expect('set-cookie', /family_tree=; path=\//)
      .expect('set-cookie', /family_tree.sig=[a-zA-Z0-9=\-_]*; path=\//)
      .expect('Content-Type', /plain/)
      .expect(200, 'OK', done);
  });
});
