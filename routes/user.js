const User = require("../model/user");

//utils
const makeId = require("../utils/random_string");
const { validateInput } = require("../utils/regexr");
const {
  authenticateToken,
  generateAccessToken,
  decoded_access,
} = require("../utils/jwt");
require("dotenv").config();

//library
const express = require("express");
const crypto = require("crypto-js");

//dao
const { addUser } = require("../dao/users/add");
const { getAllUsers } = require("../dao/users/get_all");
const { editUser } = require("../dao/users/edit");
const { deleteUser } = require("../dao/users/delete");
const { loginWithUsername, loginWithEmail } = require("../dao/users/login");
const { changePwd } = require("../dao/users/changepassword");

const router = express.Router();

//add User
router.post("/", async (req, res) => {
  if (
    req.body.fullname === undefined ||
    req.body.username === undefined ||
    req.body.email === undefined ||
    req.body.password === undefined ||
    req.body.confpassword === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "Incomplete body",
    });
    return;
  }

  if (req.body.password !== req.body.confpassword) {
    res.status(400).send({
      success: false,
      error: "Password does not match",
    });
    return;
  }

  if (validateInput(req.body.email)) {
    const password = req.body.password;
    const salt = makeId(6);
    const saltPlusPass = salt + password;
    const saltedPassword = crypto.SHA256(saltPlusPass).toString();

    const user = new User(
      null,
      makeId(8),
      req.body.fullname,
      req.body.username,
      req.body.email,
    );
    user.salt = salt;
    user.password = saltedPassword;
    user.is_deleted = 0;

    addUser(user)
      .then(async (result) => {
        res.status(200).send({
          success: true,
          result: result,
        });
      })
      .catch((e) => {
        console.error(e);
        res.status(500).send({
          success: false,
          error: e,
        });
      });
  } else {
    return res.status(400).json({ message: "Invalid email" });
  }
});

//get user
router.get("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  getAllUsers(cred.uid)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

//edit user
router.put("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  if (
    req.body.fullname === undefined ||
    req.body.username === undefined ||
    req.body.email === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (validateInput(req.body.email)) {
    console.log(req.user);
    const user = new User(
      null,
      cred.uid,
      req.body.fullname,
      req.body.username,
      req.body.email,
    );
    delete user.id;

    editUser(user)
      .then((result) => {
        res.status(200).send({
          success: true,
          result: result,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          success: false,
          error: err,
        });
      });
  } else {
    return res.status(400).json({ message: "Invalid email" });
  }
});

//delete user
router.delete("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  deleteUser(cred)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

//login
router.post("/login", async (req, res) => {
  if (validateInput(req.body.emailorusername)) {
    loginWithEmail(req.body.emailorusername, req.body.password)
      .then((result) => {
        const payload = {
          uid: result.uid,
          email: result.email,
          fullname: result.fullname,
          username: result.username,
        };

        res.status(200).send({
          success: true,
          users: result,
          token: generateAccessToken(payload),
        });
      })
      .catch((e) => {
        if (e === "AUTHENTICATION_FAILED") {
          res.status(401).send({
            success: false,
            error: "AUTHENTICATION_FAILED",
          });
        } else {
          console.error(e);
          res.status(500).send({
            success: false,
            error: e,
          });
        }
      });
  } else {
    loginWithUsername(req.body.emailorusername, req.body.password)
      .then((result) => {
        const payload = {
          uid: result.uid,
          email: result.email,
          fullname: result.fullname,
          username: result.username,
        };

        res.status(200).send({
          success: true,
          users: result,
          token: generateAccessToken(payload),
        });
      })
      .catch((e) => {
        if (e === "AUTHENTICATION_FAILED") {
          res.status(401).send({
            success: false,
            error: "AUTHENTICATION_FAILED",
          });
        } else {
          console.error(e);
          res.status(500).send({
            success: false,
            error: e,
          });
        }
      });
  }
});

//change password
router.put("/changepassword", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  if (
    req.body.oldpassword === undefined ||
    req.body.newpassword === undefined ||
    req.body.confpassword === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (req.body.newpassword !== req.body.confpassword) {
    res.status(400).send({
      success: false,
      error: "PASSWORD_MISMATCH",
    });
    return;
  }

  changePwd(cred.uid, req.body.oldpassword, req.body.newpassword)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      if (e === "AUTHENTICATION_FAILED") {
        res.status(401).send({
          success: false,
          error: "AUTHENTICATION_FAILED",
        });
      } else {
        console.error(e);
        res.status(500).send({
          success: false,
          error: e,
        });
      }
    });
});

//logout
router.post("/logout", authenticateToken, async (req, res) => {
  res.status(200).send({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;
