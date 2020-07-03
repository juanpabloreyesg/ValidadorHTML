var express = require("express");
var router = express.Router();

const { domValidation, parseHTML2JSON, parseCSS2JSON } = require("../lib/validator");
const lti = require("../lib/lti");

router.post("/", (req, res) => {
  const {
    body: { htmlContent, cssContent, htmlStructure, cssStructure, key },
  } = req;

  let htmlBuffer = Buffer.from(htmlContent, "base64");
  let cssBuffer = Buffer.from(cssContent, "base64");
  if (key) {
    let keyBuffer = Buffer.from(key, "base64").toString();
    const { lis_outcome_service_url, lis_result_sourcedid } = JSON.parse(keyBuffer);
    /*lti
      .sendResultToCoursera(lis_outcome_service_url, lis_result_sourcedid, parseFloat(result.grade))
      .then((res) => {})
      .catch((error) => {
        console.log("Error when sending results to Coursera: ", error);
      });*/
  }
  const result = domValidation(htmlBuffer, cssBuffer, htmlStructure, cssStructure);
  res.json(result);
});

router.post("/parseHTML2JSON", (req, res) => {
  const {
    body: { htmlContent },
  } = req;
  const htmlBuffer = Buffer.from(htmlContent, "base64");
  const result = parseHTML2JSON(htmlBuffer);
  res.json(result);
});

router.post("/parseCSS2JSON", (req, res) => {
  const {
    body: { contentCSS },
  } = req;
  const cssText = Buffer.from(contentCSS, "base64");
  const result = parseCSS2JSON(cssText);
  res.json(result);
});

router.post("/lti_access", function (req, res, next) {
  lti
    .registerCourseraActivity(req)
    .then(function (resp) {
      const { lis_outcome_service_url, lis_result_sourcedid } = resp;
      let key = { lis_outcome_service_url, lis_result_sourcedid };
      let buffer = Buffer.from(JSON.stringify(key)).toString("base64");
      res.redirect(`/?type=${resp.type}&exercise=${resp.exercise}&key=${buffer}`);
    })
    .catch(next);
});

module.exports = router;
