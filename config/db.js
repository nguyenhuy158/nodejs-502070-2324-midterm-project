const mysql      = require("mysql");
const connection = mysql.createConnection({
                                              host    : "localhost",
                                              user    : "root",
                                              password: "",
                                              database: "test"
                                          });

const bcrypt                     = require("bcrypt");
const saltRounds                 = 10;
const myPlaintextPassword        = "s0/\/\P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

exports.init = (req, res, next) => {
    var sql = "CREATE TABLE user (name VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log("🚀 ~ file: db.js:19 ~ err:", err.sqlMessage);
        }
        console.log("Table created");
    });
    
    next();
};

exports.getAccount = (email) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT *
                     FROM user
                     WHERE email = '${email}'`;
        console.log("🚀 ~ file: db.js:24 ~ sql:", sql);
        connection.query(sql, function (err, results) {
            if (err) {
                reject(err);
            }
            console.log("🚀 ~ file: db.js:28 ~ results:", results);
            resolve(results);
        });
    });
};

exports.createAccount = (name, email, password) => {
    return new Promise(async (resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                reject(false);
            }
            const sql = `INSERT INTO user(name, email, password)
                         VALUES ('${name}', '${email}', '${hash}')`;
            connection.query(sql, function (err, results) {
                if (err) {
                    reject(false);
                }
                return resolve(true);
            });
        });
    });
};