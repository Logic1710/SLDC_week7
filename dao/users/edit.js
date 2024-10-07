const User = require("../../model/user");

const conn = require("../../config/mysql_conn_handler");

module.exports.editUser = (users) => {
  return new Promise((resolve, reject) => {
    if (!users instanceof User) {
      reject("Wrong object");
    }

    const query =
      "UPDATE `user` SET `u_fullname`=?, `u_username`=?, `u_email`=?, `u_role`=? WHERE `u_uid` = ? AND `u_is_deleted` = 0;";
    conn.query(
      query,
      [
        users.fullname,
        users.username,
        users.email,
        users.role,
        users.uid,
      ],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      },
    );
  });
};
