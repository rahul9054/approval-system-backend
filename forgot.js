
const express=require('express');
const router=express.Router();
const bodyParser=require("body-parser");
const User=require('./model/signup.model');
const crypto = require('crypto');
const async = require('async');
const session = require('express-session')
const nodemailer = require('nodemailer');


router.use(bodyParser.urlencoded({
    extended: true
}));


router.get('/',(req,res)=>{
    res.sendFile(`${__dirname}/view/approval-front/forgot.html`)
})



router.post('/', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
           // req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'approval.reset@gmail.com',
            pass: 'approval@123'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'approavl.rest@gmail.com',
          subject: 'Approval system Reset Password Link',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
         // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  module.exports=router;