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

  exports.getSurveys = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT surveys.id, surveys.title, COUNT(questions.id) AS questions FROM surveys LEFT JOIN questions ON surveys.id = questions.surveyId GROUP BY surveys.id; ';
        db.all(sql, [], (err, rows) => {
          if (err) 
            reject(err);
          else {
            const surveys = rows.map((e) => ({ id: e.id, title: e.title, questions: e.questions}));
            resolve(surveys);
          }
        })
    }
    )
  }

  exports.getSurveyInfo = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT surveys.title as title, admins.name as author FROM surveys, admins WHERE surveys.id = ? AND surveys.adminId = admins.id;";
        db.get(sql, [id], (err, row) => {
          if(err) {
            reject(err);
            return;
          }
          if(row == undefined) {
            resolve({ error: "ID not corresponding to any survey" });
          } else {
            const surveyInfo = {
              title: row.title,
              author: row.author
            };
            resolve(surveyInfo);
          }
        }
        );
      }
    );
  }

  exports.getQuestionsBySurveyId = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, text, priority, type, min, max FROM questions WHERE surveyId=?;";
        db.all(sql, [id], (err, rows) => {
          if(err) {
            reject(err);
            return;
          }
          const questions = rows.map ( (e) => ({
            id: e.id,
            text: e.text,
            priority: e.priority,
            type: e.type,
            min: e.min,
            max: e.max
          }));
          resolve(questions);
        }
        );
      }
    );
  }

  exports.getAnswersByQuestionId = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, text FROM answers WHERE questionId=?;";
        db.all(sql, [id], (err, rows) => {
          if(err) {
            reject(err);
            return;
          }
          const answers = rows.map ( (e) => ({
            id: e.id,
            text: e.text
          }));
          resolve(answers);
        }
        );
      }
    );
  }