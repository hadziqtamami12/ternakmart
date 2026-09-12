// auditRoutes.js
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', auditController.getAuditLogs);

module.exports = router;
