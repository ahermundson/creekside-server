const mongoose = require('mongoose');

const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    type: { type: String },
    propertyName: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    zip: { type: String }
  },
  { collection: 'Locations' }
);

locationSchema.pre('save', next => {
  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
