const ledgerService = require('../services/ledger.service');

exports.getUserLedger = async (req, res) => {
  try {
    const sevispassUid = req.user.sevispassUid;
    const ledgerData = await ledgerService.getUserLedger(sevispassUid);

    res.json({
      success: true,
      ledger: ledgerData
    });
  } catch (error) {
    console.error('Get user ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger'
    });
  }
};

exports.getLedgerStats = async (req, res) => {
  try {
    const stats = await ledgerService.getLedgerStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get ledger stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger stats'
    });
  }
};

exports.getAllLedger = async (req, res) => {
  try {
    // Only admin can access all ledger
    if (req.user.sevispassUid !== 'MOCK-UID-005') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const entries = await ledgerService.getAllLedger();
    res.json({
      success: true,
      entries
    });
  } catch (error) {
    console.error('Get all ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger'
    });
  }
};

exports.verifyLedger = async (req, res) => {
  try {
    const { uid } = req.params;
    const ledgerData = await ledgerService.getUserLedger(uid);

    // Also verify the chain
    const verification = ledgerService.verifyChain(ledgerData.entries);

    res.json({
      success: true,
      uid,
      totalEntries: ledgerData.entries.length,
      chainVerified: verification.isValid,
      verificationReport: verification
    });
  } catch (error) {
    console.error('Verify ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify ledger'
    });
  }
};