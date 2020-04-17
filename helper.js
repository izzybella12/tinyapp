const emailChecker = function(email, database) {
  for (let object in database) {
    if (database[object].email === email) {
      return database[object].id; 
    } 
  } return undefined;
}

module.exports = emailChecker;