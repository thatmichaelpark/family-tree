'use strict';

process.env.NODE_ENV = 'test';

const assert = require('chai').assert;
const {suite, test} = require('mocha');
const knex = require('../knex');
const request = require('supertest');
const server = require('../server');

suite('people suite', () => {
  before(function(done) {
    knex.migrate.latest()
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  beforeEach(function(done) {
    knex.seed.run()
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  test('GET people route', (done) => {
    request(server)
      .get('/people')
      .expect(200, [{
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": "1984-12-01T08:00:00.000Z",
        "given_name": "Hien",
        "gender": "f",
        "id": 1,
        "family_name": "Dang",
        "middle_name": "Phuong",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": "1963-04-20T07:00:00.000Z",
        "given_name": "Phung",
        "gender": "f",
        "id": 2,
        "family_name": "Dang",
        "middle_name": "Thi",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": "1995-03-05T08:00:00.000Z",
        "given_name": "Nicholas",
        "gender": "m",
        "id": 3,
        "family_name": "Nguyen",
        "middle_name": "Hoai",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Thach",
        "gender": "m",
        "id": 4,
        "family_name": "Nguyen",
        "middle_name": "Van",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Lan",
        "gender": "f",
        "id": 5,
        "family_name": "Nguyen",
        "middle_name": "Thi",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Hoi",
        "gender": "m",
        "id": 6,
        "family_name": "Dang",
        "middle_name": "Van",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Nhung",
        "gender": "f",
        "id": 7,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Hanh",
        "gender": "f",
        "id": 8,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Chi",
        "gender": "f",
        "id": 9,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Tu",
        "gender": "f",
        "id": 10,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Phuc",
        "gender": "f",
        "id": 11,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Thailand",
        "gender": "f",
        "id": 12,
        "family_name": "Dang",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Ricky",
        "gender": "m",
        "id": 13,
        "family_name": "Saeturn",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Sidney",
        "gender": "f",
        "id": 14,
        "family_name": "Saeturn",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Lily",
        "gender": "f",
        "id": 15,
        "family_name": "Saeturn",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    },
    {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Nathan",
        "gender": "m",
        "id": 16,
        "family_name": "Saeturn",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
    }], done);
  });

  test('GET people/2 route', (done) => {
    request(server)
    .get('/people/2')
    .expect(200,
      {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": "1963-04-20T07:00:00.000Z",
        "given_name": "Phung",
        "gender": "f",
        "id": 2,
        "family_name": "Dang",
        "middle_name": "Thi",
        "updated_at": "2016-07-08T03:33:59.857Z"
      }, done);
    });
    test('GET people/15 route', (done) => {
      request(server)
      .get('/people/15')
      .expect(200, {
        "created_at": "2016-07-08T03:33:59.857Z",
        "dob": null,
        "given_name": "Lily",
        "gender": "f",
        "id": 15,
        "family_name": "Saeturn",
        "middle_name": "",
        "updated_at": "2016-07-08T03:33:59.857Z"
      }, done);
    });

    test('GET people/1/children route', (done) => {
      request(server)
      .get('/people/1/children')
      .expect(200, [], done);
    });

    test('GET people/2/children route', (done) => {
      request(server)
      .get('/people/2/children')
      .expect(200, [{ child_id: 1}, { child_id: 3}], done);
    });

    test('GET people/1/parents route', (done) => {
      request(server)
      .get('/people/1/parents')
      .expect(200, [{ parent_id: 2 }, { parent_id: 4 }], done);
    });

    test('GET people/2/parents route', (done) => {
      request(server)
      .get('/people/2/parents')
      .expect(200, [{ parent_id: 5 }], done);
    });

    test('GET people/5/parents route', (done) => {
      request(server)
      .get('/people/5/parents')
      .expect(200, [], done);
    });

    test('POST /people', (done) => {
      request(server)
        .post('/people')
        .send({
          given_name: 'Tina',
          middle_name: 'Ruth',
          family_name: 'Belcher',
          dob: '2003-04-05',
          gender: 'f'
        })
        .expect('Content-Type', /json/)
        .expect((res) => {
          delete res.body.created_at;
          delete res.body.updated_at;
        })
        .expect(200, {
          id: 17,
          given_name: 'Tina',
          middle_name: 'Ruth',
          family_name: 'Belcher',
          dob: '2003-04-05T08:00:00.000Z',
          gender: 'f'
        }, done);
    });
});
