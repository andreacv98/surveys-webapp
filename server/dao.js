'use strict';

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');


// open the database
const db = new sqlite.Database('./survey.db', (err) => {
  if (err) throw err;
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
        const user = { id: row.id, username: row.email, name: row.name };

        bcrypt.compare(password, row.hashpwd).then(result => {
          if (result)
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
        resolve({ error: 'Admin not found.' });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = { id: row.id, username: row.email, name: row.name }
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
        const surveys = rows.map((e) => ({ id: e.id, title: e.title, questions: e.questions }));
        resolve(surveys);
      }
    })
  }
  )
}

exports.getMySurveys = (idAdmin) => {
  return new Promise((resolve, reject) => {
    
    const sql = 'SELECT surveys.id, surveys.title FROM surveys WHERE surveys.adminId= ?; ';
    db.all(sql, [idAdmin], (err, rows) => {
      if (err)
        reject(err);
      else {
        const surveys = rows.map((e) => ({ id: e.id, title: e.title}));
        resolve(surveys);
      }
    })
  }
  )
}

exports.getMySurveyCount = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT (*) as count FROM (SELECT * FROM usersanswers, answers, questions, surveys WHERE usersanswers.answerId = answers.id AND answers.questionId = questions.id AND surveys.id = questions.surveyId AND surveys.id= ? GROUP BY usersanswers.userId)';
    db.get(sql, [idSurvey], (err, row) => {
      if (err)
        reject(err);
      else {
        const count = row.count;
        resolve(count);
      }
    })
  }
  )
}

exports.getSurveyInfo = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT surveys.title as title, admins.name as author FROM surveys, admins WHERE surveys.id = ? AND surveys.adminId = admins.id;";
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
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
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map((e) => ({
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
      if (err) {
        reject(err);
        return;
      }
      const answers = rows.map((e) => ({
        id: e.id,
        text: e.text
      }));
      resolve(answers);
    }
    );
  }
  );
}

exports.insertAnswer = (text, questionId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO answers (text, questionId) VALUES (?, ?);";
    db.run(sql, [text, questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}

exports.insertUser = (user) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (name) VALUES (?);";
    db.run(sql, [user], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}

exports.insertUserAnswer = (userId, answerId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO usersanswers (userId, answerId) VALUES (?, ?);";
    db.run(sql, [userId, answerId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}

exports.getUserAnswers = (surveyId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT questions.id, questions.text, questions.priority, answers.text AS aText FROM questions, answers, usersanswers WHERE questions.id = answers.questionId AND answers.id = usersanswers.answerId AND usersanswers.userId = ? AND questions.surveyId = ?;";
    db.all(sql, [userId, surveyId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const answers = rows.map((e) => ({
        qId: e.id,
        qText: e.text,
        qPriority: e.priority,
        aText: e.aText
      }));
      resolve(answers);
    }
    );
  }
  );
}

exports.getUsersSurvey = (surveyId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT users.id, users.name FROM usersanswers, answers, questions, users, surveys WHERE usersanswers.answerId = answers.id AND users.id = usersanswers.userId AND answers.questionId = questions.id AND questions.surveyId = ? GROUP BY usersanswers.userId";
    db.all(sql, [surveyId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const users = rows.map((e) => ({
        id: e.id,
        name: e.name
      }));
      resolve(users);
    }
    );
  }
  );
}

exports.insertSurvey = (surveyTitle, userId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO surveys (title, adminId) VALUES (?, ?);";
    db.run(sql, [surveyTitle, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}

exports.insertQuestion = (text, priority, type, min, max, surveyId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO questions (text, priority, type, min, max, surveyId) VALUES (?, ?, ?, ?, ?, ?);";
    db.run(sql, [text, priority, type, min, max, surveyId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}

exports.insertAnswer = (text, questionId) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO answers (text, questionId) VALUES (?, ?);";
    db.run(sql, [text, questionId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    }
    );
  }
  );
}