const mongoose = require('mongoose');

const { Schema } = mongoose;

const timeClockSchema = new Schema(
  {
    punched_in: { type: Date },
    punched_out: { type: Date },
    active_timeclock: { type: Boolean },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    location_id: { type: Schema.Types.ObjectId, ref: 'Location' }
  },
  { collection: 'TimeClocks' }
);

timeClockSchema.pre('save', next => {
  next();
});

const TimeClock = mongoose.model('TimeClock', timeClockSchema);

module.exports = TimeClock;
