"use strict";

var expect = require("chai").expect;
var mongodb = require("mongodb");
var mongoose = require("mongoose");

module.exports = function (app) {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String,
  });

  let Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      var project = req.params.project;

      var filterObject = Object.assign(req.query);
      filterObject["project"] = project;

      //console.log(req.query)
      //console.log(filterObject)

      Issue.find(filterObject, (error, arrayOfResults) => {
        if (!error && arrayOfResults) {
          return res.json(arrayOfResults);
        }
      });
    })

    .post(function (req, res) {
      var project = req.params.project;

      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json("Required fields missing from request");
      }

      var newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project,
      });

      newIssue.save((error, savedIssue) => {
        if (!error && savedIssue) {
          //console.log(savedIssue)
          return res.json(savedIssue);
        }
      });

      //console.log(req.body);
    })

    .put(function (req, res) {
      var project = req.params.project;

      var updateObject = {};

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != "") {
          updateObject[key] = req.body[key];
        }
      });

      //console.log(req.body);

      if (Object.keys(updateObject).length < 2) {
        return res.json("no update fields sent");
      }

      console.log(updateObject);

      updateObject["updated_on"] = new Date().toUTCString();

      Issue.findByIdAndUpdate(
        req.body._id,
        updateObject,
        { new: true },
        (error, updatedIssue) => {
          if (!error && updatedIssue) {
            return res.json("successfully updated");
          } else if (!updatedIssue) {
            return res.json("could not update " + req.body._id);
          }
        }
      );
    })

    .delete(function (req, res) {
      var project = req.params.project;

      if (!req.body._id) {
        return res.json("id error");
      }

      Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {
        if (!error && deletedIssue) {
          res.json("deleted " + deletedIssue.id);
        } else if (!deletedIssue) {
          res.json("could not delete" + req.body._id);
        }
      });
    });
};
