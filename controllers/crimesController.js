const Crime = require('../models/Crime');

// --- Helpers ---
function yearMatch(dateField, year) {
  // Use $expr to match by year of REPORT_DAT
  return {
    $expr: {
      $eq: [{ $year: `$${dateField}` }, year]
    }
  };
}

// --- CRUD ---
exports.createCrime = async (req, res) => {
  try {
    const doc = await Crime.create(req.body);
    res.status(201).json({ ok: true, doc });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

exports.listCrimes = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    // Convert limit/page to numbers
    const lim = Math.max(1, parseInt(limit, 10) || 10);
    const pg = Math.max(1, parseInt(page, 10) || 1);

    // Simple filtering with exact matches on known fields
    const q = {};
    ['OFFENSE', 'SHIFT', 'METHOD', 'WARD', 'PSA', 'NEIGHBORHOOD_CLUSTER'].forEach(k => {
      if (filters[k]) q[k] = filters[k];
    });

    const total = await Crime.countDocuments(q);
    const rows = await Crime.find(q)
      .sort({ REPORT_DAT: -1 })
      .skip((pg - 1) * lim)
      .limit(lim)
      .lean();

    res.json({ total, page: pg, limit: lim, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

exports.getCrime = async (req, res) => {
  try {
    const doc = await Crime.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, doc });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

exports.updateCrime = async (req, res) => {
  try {
    const doc = await Crime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, doc });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

exports.deleteCrime = async (req, res) => {
  try {
    const doc = await Crime.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, deleted: doc._id });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

// --- 8 QUESTIONS ---
// Q1: Which five OFFENSE categories occurred most frequently in 2025?
exports.top5Offense2025 = async (req, res) => {
  try {
    const year = 2025;
    const rows = await Crime.aggregate([
      { $match: { ...yearMatch('REPORT_DAT', year) } },
      { $group: { _id: '$OFFENSE', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, offense: '$_id', count: 1 } },
    ]);
    res.json({
      question: 'Which five OFFENSE categories occurred most frequently in 2025?',
      answer: rows,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q2: On which day of the week are incidents most common (based on REPORT_DAT)?
// 0=Sunday ... 6=Saturday
exports.mostCommonWeekday = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $match: { REPORT_DAT: { $ne: null } } },
      { $group: { _id: { $dayOfWeek: '$REPORT_DAT' }, count: { $sum: 1 } } }, // Mongo: 1=Sunday,...7=Saturday
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    let answer = null;
    if (rows[0]) {
      // Convert 1..7 to labels
      const map = {1:'Sunday',2:'Monday',3:'Tuesday',4:'Wednesday',5:'Thursday',6:'Friday',7:'Saturday'};
      answer = { weekday: map[rows[0]._id] || rows[0]._id, count: rows[0].count };
    }
    res.json({
      question: 'On which day of the week are incidents most common (based on REPORT_DAT)?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q3: What is the busiest hour for reported incidents?
exports.busiestHour = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $match: { REPORT_DAT: { $ne: null } } },
      { $group: { _id: { $hour: '$REPORT_DAT' }, count: { $sum: 1 } } }, // 0..23
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    let answer = null;
    if (rows[0]) answer = { hour: rows[0]._id, count: rows[0].count };
    res.json({
      question: 'What is the busiest hour for reported incidents?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q4: Which WARD has the highest number of incidents?
exports.topWard = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $match: { WARD: { $ne: null } } },
      { $group: { _id: '$WARD', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    let answer = null;
    if (rows[0]) answer = { WARD: rows[0]._id, count: rows[0].count };
    res.json({
      question: 'Which WARD has the highest number of incidents?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q5: Which PSA records the most incidents?
exports.topPSA = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $match: { PSA: { $ne: null } } },
      { $group: { _id: '$PSA', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    let answer = null;
    if (rows[0]) answer = { PSA: rows[0]._id, count: rows[0].count };
    res.json({
      question: 'Which PSA records the most incidents?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q6: What fraction of incidents involve each METHOD (percent by METHOD)?
exports.methodFractions = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $group: { _id: '$METHOD', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = rows.reduce((s, r) => s + r.count, 0) || 1;
    const answer = rows.map(r => ({
      METHOD: r._id || 'UNKNOWN',
      count: r.count,
      percent: +( (r.count / total) * 100 ).toFixed(2),
    }));
    res.json({
      question: 'What fraction of incidents involve each METHOD (percent by METHOD)?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q7: How do incident counts compare across SHIFT (Day/Evening/Midnight), and which is highest?
exports.shiftComparison = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $group: { _id: '$SHIFT', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const answer = rows.map(r => ({ SHIFT: r._id || 'UNKNOWN', count: r.count }));
    res.json({
      question: 'How do incident counts compare across SHIFT (Day/Evening/Midnight), and which is highest?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Q8: Which month has the most reported incidents (by REPORT_DAT)?
exports.topMonth = async (req, res) => {
  try {
    const rows = await Crime.aggregate([
      { $match: { REPORT_DAT: { $ne: null } } },
      { $group: { _id: { $month: '$REPORT_DAT' }, count: { $sum: 1 } } }, // 1..12
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    let answer = null;
    if (rows[0]) answer = { month: rows[0]._id, count: rows[0].count };
    res.json({
      question: 'Which month has the most reported incidents (by REPORT_DAT)?',
      answer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
