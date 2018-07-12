const nodemailer = require('nodemailer');

// create reusable transport method (opens pool of SMTP connections)
const smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'gmail.user@gmail.com',
    pass: 'userpass'
  }
});

// setup e-mail data with unicode symbols
const mailOptions = {
  from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
  to: 'alex.hermundson@gmail.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world ✔', // plaintext body
  html: '<b>Hello world ✔</b>' // html body
};

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, (error, response) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Message sent: ${response.message}`);
  }

  // if you don't want to use this transport object anymore, uncomment following line
  // smtpTransport.close(); // shut down the connection pool, no more messages
});
