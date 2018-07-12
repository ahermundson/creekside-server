const mongoose = require('mongoose');

const { Schema } = mongoose;

const jobClockSchema = new Schema(
  {
    job_started: { type: Date },
    job_finished: { type: Date },
    active_job: { type: Boolean },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location' }
  },
  { collection: 'JobClocks' }
);

jobClockSchema.pre('save', next => {
  next();
});

const JobClock = mongoose.model('JobClock', jobClockSchema);

module.exports = JobClock;
