import mongoose from 'mongoose';

const { Schema } = mongoose;

const foremanNotesSchema = new Schema(
  {
    location_id: { type: Schema.Types.ObjectId, ref: 'Location' },
    note: { type: String }
  },
  { collection: 'ForemanNotes' }
);

foremanNotesSchema.pre('save', next => {
  next();
});
// Foreman Notes
export default mongoose.model('ForemanNotes', foremanNotesSchema);
