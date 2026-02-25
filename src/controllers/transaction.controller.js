/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.service");

async function createTransaction(req, res) {
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "From Acc., To Acc., Amt. and idempotency key are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid Accounts!!",
    });
  }

  /***
   * 2. Validate Idempotency key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "The transaction has been already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing..",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "The Transaction processing failed, please try again",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction has been reversed, please try again",
      });
    }
  }

  /***
   * 3. Check account Status
   * - we move to this when Trasaction does not already exists, its new one
   * - first we check the status of debit and credit accounts are they active
   */

  if (fromUserAccount.status != "ACTIVE" || toUserAccount.status != "ACTIVE") {
    return res.status(400).json({
      message:
        "Both debit and credit account must be active for processing the transaction",
    });
  }

  /***
   * 4. Derive sender balance from the ledger
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Request amount is ${amount}`,
    });
  }

  /**
   * 5. Create transaction
   */
  const transaction = await transactionModel.create({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      {
        session,
      },
    );
    //for testing
    //throw new Error("Testing failure");

    //to check parallel req with same idem key
    // await (() => {
    //   return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    // })();
    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      {
        session,
      },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    //if the transaction fails it set the status from pending to failed
    await transactionModel.updateOne(
      { _id: transaction._id },
      { status: "FAILED" },
    );

    return res.status(500).json({
      message: "Transaction failed",
    });
  } finally {
    session.endSession();
  }

  /**
   * 10. Send Email Notification of the transaction
   */

  await emailService.sendTransactionSuccessEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotency key are required",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid Account",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const transaction = await transactionModel.create({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      {
        session,
      },
    );
    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      {
        session,
      },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    await transactionModel.updateOne(
      { _id: transaction._id },
      { status: "FAILED" },
    );

    return res.status(500).json({
      message: "Transaction failed",
    });
  } finally {
    session.endSession();
  }

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
