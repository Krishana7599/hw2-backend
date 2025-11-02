const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/crimesController');

// CRUD
router.post('/crimes', ctrl.createCrime);
router.get('/crimes', ctrl.listCrimes);
router.get('/crimes/:id', ctrl.getCrime);
router.put('/crimes/:id', ctrl.updateCrime);
router.delete('/crimes/:id', ctrl.deleteCrime);

// 8 Questions
router.get('/questions/top5-offense-2025', ctrl.top5Offense2025);
router.get('/questions/most-common-weekday', ctrl.mostCommonWeekday);
router.get('/questions/busiest-hour', ctrl.busiestHour);
router.get('/questions/top-ward', ctrl.topWard);
router.get('/questions/top-psa', ctrl.topPSA);
router.get('/questions/method-fractions', ctrl.methodFractions);
router.get('/questions/shift-comparison', ctrl.shiftComparison);
router.get('/questions/top-month', ctrl.topMonth);

module.exports = router;
