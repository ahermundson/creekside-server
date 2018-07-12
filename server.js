/* eslint no-console:0 */
/* eslint import/first:0 */
require('dotenv').config();

import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import jwt from 'jsonwebtoken';
import mongoConnection from './modules/mongo-connection';
import models from './models';
import loaders from './loaders';
import { refreshTokens } from './auth';
import nodemailer from 'nodemailer';
import _ from 'lodash';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = express();

mongoose.Promise = global.Promise;
mongoConnection.connect();

// const corsOptions = {
//   origin: 'http://creeksidelawnandlandscape.s3-website.us-east-2.amazonaws.com',
//   credentials: true,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   preflightContinue: true
// };

// app.options('*', cors(corsOptions));
// app.use(cors(corsOptions));
app.use(cors('*'));

const addUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, process.env.SECRET);
      req.user = user;
    } catch (err) {
      console.log('Error in Add User', err);
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        models,
        process.env.SECRET,
        process.env.SECRET2
      );

      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};

app.use(addUser);

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      loaders,
      SECRET: process.env.SECRET,
      SECRET2: process.env.SECRET2,
      user: req.user
    }
  }))
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.use(bodyParser.json());

app.post('/forgot-password', async (req, res) => {
  const user = await models.User.findOne({ email: req.body.email });
  const secret = process.env.SECRET2 + user.password;
  const createRefreshToken = jwt.sign(
    {
      user: _.pick(user, '_id')
    },
    secret,
    {
      expiresIn: '1h'
    }
  );

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alex.hermundson@gmail.com',
      pass: 'stpgqmcustjynypo'
    }
  });

  const mailOptions = {
    from: 'Creekside Lawn and Landscape ✔ <hello@alexhermundson.com>',
    to: req.body.email,
    subject: 'Password Reset',
    text: 'Reset password',
    html: `<a href="http://localhost:3000/reset-password?token=${createRefreshToken}">Click here to reset your password</a>`
  };

  transporter.sendMail(mailOptions, error => {
    if (error) {
      res.sendStatus(500);
    } else {
      res.send(true);
    }
  });
});

// app.post('/timeclock', (req, res) => {
//   const timeclockToAdd = new TimeClock({
//     punched_in: req.body.punched_in,
//     user_id: req.body.user_id,
//     active_timeclock: req.body.active_timeclock,
//     location_id: req.body.location_id
//   });

//   timeclockToAdd.save((err, data) => {
//     if (err) {
//       console.log('Error: ', err);
//       res.sendStatus(500);
//     } else {
//       res.send(data);
//     }
//   });
// });

// app.put('/timeClockUpdate', (req, res) => {
//   TimeClock.findOneAndUpdate(
//     { user_id: req.body.userId, active_timeclock: true },
//     { $set: { punched_out: req.body.punchOutTime, active_timeclock: false } },
//     err => {
//       if (err) {
//         console.log('Put ERR: ', err);
//         res.sendStatus(500);
//       } else {
//         res.sendStatus(200);
//       }
//     }
//   );
// });

// app.post('/jobclock', (req, res) => {
//   const jobClockToAdd = new JobClock({
//     job_started: req.body.job_started,
//     user_id: req.body.user_id,
//     active_job: true,
//     location_id: req.body.location_id
//   });

//   jobClockToAdd.save((err, data) => {
//     if (err) {
//       console.log('Error: ', err);
//       res.sendStatus(500);
//     } else {
//       res.send(data);
//     }
//   });
// });

// app.put('/jobClockUpdate', (req, res) => {
//   JobClock.findOneAndUpdate(
//     { user_id: req.body.userId, active_job: true },
//     { $set: { job_finished: req.body.job_finished, active_job: false } },
//     err => {
//       if (err) {
//         console.log('Put ERR: ', err);
//         res.sendStatus(500);
//       } else {
//         res.sendStatus(200);
//       }
//     }
//   );
// });

// app.get('/allUserTimeClock', (req, res) => {
//   auth.validateToken(authPems, req.headers.authorization).then(response => {
//     if (response) {
//       const isAdmin =
//         response.payload['cognito:groups'] &&
//         response.payload['cognito:groups'].includes('Admin');

//       if (!isAdmin) {
//         res.sendStatus(401);
//       } else {
//         TimeClock.find({
//           punched_in: { $gte: req.query.startDate, $lte: req.query.endDate },
//           user_id: req.query.userID
//         }).exec((timeClockErr, timeClockData) => {
//           if (!timeClockErr) {
//             res.send(timeClockData);
//           } else {
//             res.sendStatus(501);
//           }
//         });
//       }
//     }
//   });
// });

// app.get('/employeeHours', (req, res) => {
//   TimeClock.find({
//     user_id: req.query.user_id,
//     punched_out: { $gte: req.query.startDate, $lte: req.query.endDate }
//   }).exec((err, data) => {
//     if (!err) {
//       res.send(data);
//     } else {
//       res.sendStatus(500);
//     }
//   });
// });

// app.get('/singleTimeClock', (req, res) => {
//   const start = moment(req.query.date).startOf('day');
//   const end = moment(start).add(1, 'days');
//   TimeClock.find({
//     user_id: req.query.userId,
//     punched_in: {
//       $gte: moment(start).format(),
//       $lt: moment(end).format()
//     }
//   }).exec((err, data) => {
//     if (!err) {
//       res.send(data);
//     } else {
//       res.sendStatus(500);
//     }
//   });
// });

// app.put('/singleTimeClock', (req, res) => {
//   TimeClock.findOneAndUpdate(
//     { _id: req.body.timeClockID },
//     {
//       $set: {
//         punched_in: req.body.punched_in,
//         punched_out: req.body.punched_out
//       }
//     },
//     err => {
//       if (err) {
//         console.log('Put ERR: ', err);
//         res.sendStatus(500);
//       } else {
//         res.sendStatus(200);
//       }
//     }
//   );
// });

// app.post('/foremanNote', (req, res) => {
//   const foremanNoteToAdd = new ForemanNote({
//     note: req.body.note,
//     location_id: req.body.location_id
//   });

//   foremanNoteToAdd.save((err, data) => {
//     if (err) {
//       console.log('Error: ', err);
//       res.sendStatus(500);
//     } else {
//       res.send(data);
//     }
//   });
// });

// 8081 for AWS
app.listen(3001, () => console.log('Example app listening on port 3001!'));
