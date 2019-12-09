const express = require("express");

const db = require("./data/dbConfig.js");

const server = express();

server.use(express.json());
server.use(logger);

server.get("/", (req, res) => {
  res.send("<h1>SERVER IS UP</h1>");
});

// request handlers

// CREATE
server.post("/account", bodyValidation, (req, res) => {
  accountData = req.body;

  db("accounts")
    .insert(accountData, "id")
    .then(ids => {
      const id = ids[0];

      return db("accounts")
        .select("id", "name", "budget")
        .where({ id })
        .first()
        .then(account => {
          res.status(201).json({ account });
        });
    })
    .catch(err => {
      res.status(500).json({ err: "Error Occured While Posting new Account" });
    });
});

// READ
server.get("/accounts", (req, res) => {
  db.select("*")
    .from("accounts")
    .then(acct => {
      res.status(200).json({ acct });
    })
    .catch(err => {
      res.status(500).json({
        errorMessage:
          "Sorry, error occured while fetching accounts. Please, contact Back-End Developer"
      });
    });
});

// UPDATE
server.put("/account/:id", bodyValidation, (req, res) => {
  body = req.body;
  const { id } = req.params;

  db("accounts")
    .where({ id })
    .update(body)
    .then(count => {
      if (count > 0) {
        res.status(201).json({ message: `${count} records updated` });
      } else {
        res.status(404).json({ message: "Post Not Found" });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        errorMessage: "Error updating the post"
      });
    });
});

// DELETE;
server.delete("/account/:id", (req, res) => {
  const { id } = req.params;
  db("accounts")
    .where({ id })
    .del()
    .then(count => {
      res.status(200).json({ count: `${count} account(s) deleted` });
    })
    .catch(err => {
      res
        .status(500)
        .json({ errorMessage: "Error while trying to delete account" });
    });
});

// middleware

function bodyValidation(req, res, next) {
  const body = req.body;
  if (body < 1) {
    res.status(400).json({ errorMessage: "Name & Budget required" });
  } else if (body.name < 1) {
    res.status(400).json({ errorMessage: "Name required" });
  } else if (body.budget < 0) {
    res.status(400).json({ errorMessage: "Budget required" });
  } else {
    next();
  }
}

function logger(req, res, next) {
  console.log(`${req.method} to ${req.originalUrl} at ${new Date()}`);
  next();
}

module.exports = server;
