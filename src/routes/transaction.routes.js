const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");
const ledgerModel = require("../models/ledger.model");

/**
 * -POST /api/transactions/
 * -Create a new transaction
 */
router.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);

/**
 * -POST /api/transaction/system/initial-funds
 * -Create initial funds transaction from system user
 */

router.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = router;
