import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // },
  prompt: {
    type: String,
    required: true
  },
  responses: [{
    model: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    accuracyScore: {
      type: Number,
      required: true
    }
  }],
  userFeedback: {
    rating: Number,
    comment: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);