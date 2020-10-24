var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

let id1 = "";
let id2 = "";

describe("Functional its", function () {
  describe("POST /api/issues/{project} => object with issue data", function () {
    it("Every field filled in", function (done) {
      chai
        .request(server)
        .post("/api/issues/it")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional it - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional it - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.project, "it");
          id1 = res.body._id;
          console.log("id 1 has been set as " + id1);
          done();
        });
    });

    it("Required fields filled in", function (done) {
      chai
        .request(server)
        .post("/api/issues/it")
        .send({
          issue_title: "Title 2",
          issue_text: "text",
          created_by: "Functional it - Every field filled in",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title 2");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional it - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "it");
          id2 = res.body._id;
          console.log("id 2 has been set as " + id2);
          done();
        });
    });

    it("Missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/it")
        .send({
          issue_title: "Title",
        })
        .end(function (err, res) {
          assert.equal(res.body, "Required fields missing from request");
          done();
        });
    });
  });

  describe("PUT /api/issues/{project} => text", function () {
    it("No body", function (done) {
      chai
        .request(server)
        .put("/api/issues/it")
        .send({})
        .end(function (err, res) {
          assert.equal(res.body, "no update fields sent");
          done();
        });
    });

    it("One field to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/it")
        .send({
          _id: id1,
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body, "successfully updated");
          done();
        });
    });

    it("Multiple fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/it")
        .send({
          _id: id2,
          issue_title: "new title",
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body, "successfully updated");
          done();
        });
    });
  });

  describe("GET /api/issues/{project} => Array of objects with issue data", function () {
    it("No filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/it")
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          done();
        });
    });

    it("One filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/it")
        .query({ created_by: "Functional it - Every field filled in" })
        .end(function (err, res) {
          res.body.forEach((issueResult) => {
            assert.equal(
              issueResult.created_by,
              "Functional it - Every field filled in"
            );
          });
          done();
        });
    });

    it("Multiple filters (it for multiple fields you know will be in the db for a return)", function (done) {
      chai
        .request(server)
        .get("/api/issues/it")
        .query({
          open: true,
          created_by: "Functional it - Every field filled in",
        })
        .end(function (err, res) {
          res.body.forEach((issueResult) => {
            assert.equal(issueResult.open, true);
            assert.equal(
              issueResult.created_by,
              "Functional it - Every field filled in"
            );
          });
          done();
        });
    });
  });

  describe("DELETE /api/issues/{project} => text", function () {
    it("No _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/it")
        .send({})
        .end(function (err, res) {
          assert.equal(res.body, "id error");
          done();
        });
    });

    it("Valid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/it")
        .send({
          _id: id1,
        })
        .end(function (err, res) {
          assert.equal(res.body, "deleted " + id1);
          done();
        });
    });
  });
});
