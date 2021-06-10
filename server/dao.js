'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');


// open the database
const db = new sqlite.Database('./survey.db', (err) => {
  if(err) throw err;
});

//getAdmin
exports.getAdmin = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM admins WHERE email = ?';
        db.get(sql, [email], (err, row) => {
          if (err) 
            reject(err);
          else if (row === undefined) {
            resolve(false);
          }
          else {
            const user = {id: row.id, username: row.email, name: row.name};

            bcrypt.compare(password, row.hashpwd).then(result => {
              if(result)
                resolve(user);
              else
                resolve(false);
            });
          }
      });
    });
  };

//getAdminById
exports.getAdminById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM admins WHERE id = ?';
        db.get(sql, [id], (err, row) => {
          if (err) 
            reject(err);
          else if (row === undefined)
            resolve({error: 'Admin not found.'});
          else {
            // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
            const user = {id: row.id, username: row.email, name: row.name}
            resolve(user);
          }
      });
    });
  };