const mongoose = require('mongoose');

const CrimeSchema = new mongoose.Schema(
  {
    OFFENSE: { type: String, index: true },
    REPORT_DAT: { type: Date, index: true },
    START_DATE: { type: Date },
    END_DATE: { type: Date },
    SHIFT: { type: String, index: true },
    METHOD: { type: String, index: true },
    WARD: { type: String, index: true },
    PSA: { type: String, index: true },
    NEIGHBORHOOD_CLUSTER: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crime', CrimeSchema);
