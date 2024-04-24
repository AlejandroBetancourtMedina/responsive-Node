const express = require('express');
const router = express.Router();
const { checkResponsive } = require('../controllers/responsiveController');
const { validateHTML, validateCSS } = require('../controllers/validationController');

router.post('/check-responsive', checkResponsive);
router.post('/validate-html', validateHTML);
router.post('/validate-css', validateCSS);

module.exports = router;