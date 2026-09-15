// Task 8: Express 4.16+ ships body parsing built in (express.json()/express.urlencoded()).
// This file documents that choice and exposes a single helper so server.js
// has one place to configure body parsing behavior/limits.
const express = require("express");

module.exports = function configureBodyParsing(app) {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
};
