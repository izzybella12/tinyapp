const { assert } = require('chai');
const emailChecker = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailChecker', function() {
  it('should return a user with a valid email', function() {
    const user = emailChecker("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it('should return undefined with an invalid email', function() {
    const user = emailChecker("isabella@yahoo.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  it('should return undefined when not given an email', function() {
    const user = emailChecker(testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
  it('should return undefined when not given a user', function () {
    const user = emailChecker("isabella@yahoo.com")
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});
