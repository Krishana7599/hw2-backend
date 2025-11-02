const mongoose = require('mongoose');
const Crime = require('../models/Crime');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hw2';
const URL = 'https://opendata.dc.gov/api/download/v1/items/74d924ddc3374e3b977e6f002478cb9b/geojson?layers=7';

(async () => {
  try {
    console.log('[SEED] Connecting:', MONGO);
    await mongoose.connect(MONGO);
    console.log('[SEED] Fetching dataset…');
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const geo = await res.json();

    const docs = (geo.features || []).map(f => {
      const p = f.properties || {};
      return {
        OFFENSE: p.OFFENSE || null,
        REPORT_DAT: p.REPORT_DAT ? new Date(p.REPORT_DAT) : null,
        START_DATE: p.START_DATE ? new Date(p.START_DATE) : null,
        END_DATE: p.END_DATE ? new Date(p.END_DATE) : null,
        SHIFT: p.SHIFT || null,
        METHOD: p.METHOD || null,
        WARD: p.WARD ? String(p.WARD) : null,
        PSA: p.PSA ? String(p.PSA) : null,
        NEIGHBORHOOD_CLUSTER: p.NEIGHBORHOOD_CLUSTER || null,
      };
    });

    console.log('[SEED] Clearing Crime collection…');
    await Crime.deleteMany({});

    if (docs.length) {
      console.log(`[SEED] Inserting ${docs.length} documents…`);
      await Crime.insertMany(docs, { ordered: false });
    } else {
      console.log('[SEED] No docs parsed from dataset.');
    }

    console.log('[SEED] Done.');
    process.exit(0);
  } catch (e) {
    console.error('[SEED] ERROR:', e);
    process.exit(1);
  }
})();
