// Submodule imports
const User = require("../../model/user");

const conn = require("../../config/mysql_conn_handler");

module.exports.addUser = (user) => {
  return new Promise((resolve, reject) => {
    if ((!user) instanceof User) {
      reject(WRONG_OBJECT);
    }

    const query =
      "INSERT INTO `user`(`u_uid`, `u_fullname`, `u_username`, `u_email`, `u_salt`, `u_password`, `u_is_deleted`) VALUES (?,?,?,?,?,?,?)";
    conn.query(
      query,
      [
        user.uid,
        user.fullname,
        user.username,
        user.email,
        user.salt,
        user.password,
        user.is_deleted,
      ],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          user.id = res.insertId;
          delete user.id;
          delete user.password;
          delete user.salt;
          resolve(user);
        }
      },
    );
  });
};
