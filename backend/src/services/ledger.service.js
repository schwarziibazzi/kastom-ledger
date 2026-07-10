const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class LedgerService {
  /**
   * Create a SHA-256 hash of data
   */
  hashData(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Create a new ledger entry with blockchain-like chaining
   */
  async createEntry(actionType, actorUid, metadata = {}) {
    try {
      // Get the last ledger entry to chain hashes
      const lastEntry = await prisma.ledgerEntry.findFirst({
        orderBy: { timestamp: 'desc' }
      });

      const entryData = {
        actionType,
        actorUid,
        timestamp: new Date().toISOString(),
        metadata,
        previousHash: lastEntry?.currentHash || null
      };

      // Create the current hash
      const currentHash = this.hashData(entryData);
      entryData.currentHash = currentHash;

      // Create ledger entry
      const entry = await prisma.ledgerEntry.create({
        data: {
          actionType: entryData.actionType,
          actorUid: entryData.actorUid,
          timestamp: new Date(entryData.timestamp),
          previousHash: entryData.previousHash,
          currentHash: entryData.currentHash,
          metadata: entryData.metadata
        }
      });

      return entry;
    } catch (error) {
      console.error('Ledger entry creation error:', error);
      throw error;
    }
  }

  /**
   * Get complete ledger history for a user
   */
  async getUserLedger(actorUid) {
    try {
      const entries = await prisma.ledgerEntry.findMany({
        where: { actorUid },
        orderBy: { timestamp: 'asc' }
      });

      // Verify chain integrity
      const integrityCheck = this.verifyChain(entries);
      
      return {
        entries,
        integrity: integrityCheck
      };
    } catch (error) {
      console.error('Get user ledger error:', error);
      throw error;
    }
  }

  /**
   * Get all ledger entries (admin only)
   */
  async getAllLedger() {
    try {
      const entries = await prisma.ledgerEntry.findMany({
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              sevispassUid: true,
              province: true
            }
          }
        }
      });

      return entries;
    } catch (error) {
      console.error('Get all ledger error:', error);
      throw error;
    }
  }

  /**
   * Verify the integrity of the ledger chain
   */
  verifyChain(entries) {
    let isValid = true;
    const invalidEntries = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Verify hash matches data
      const data = {
        actionType: entry.actionType,
        actorUid: entry.actorUid,
        timestamp: entry.timestamp.toISOString(),
        metadata: entry.metadata,
        previousHash: entry.previousHash
      };
      
      const computedHash = this.hashData(data);
      
      if (computedHash !== entry.currentHash) {
        isValid = false;
        invalidEntries.push({
          id: entry.id,
          actionType: entry.actionType,
          reason: 'Hash mismatch'
        });
      }
      
      // Verify chain linking
      if (i > 0) {
        const prevEntry = entries[i - 1];
        if (entry.previousHash !== prevEntry.currentHash) {
          isValid = false;
          invalidEntries.push({
            id: entry.id,
            actionType: entry.actionType,
            reason: 'Chain broken'
          });
        }
      }
    }

    return {
      isValid,
      totalEntries: entries.length,
      invalidEntries: invalidEntries.length > 0 ? invalidEntries : null
    };
  }

  /**
   * Get ledger statistics
   */
  async getLedgerStats() {
    try {
      const totalEntries = await prisma.ledgerEntry.count();
      const actions = await prisma.ledgerEntry.groupBy({
        by: ['actionType'],
        _count: {
          actionType: true
        }
      });

      const uniqueUsers = await prisma.ledgerEntry.groupBy({
        by: ['actorUid']
      });

      return {
        totalEntries,
        uniqueActors: uniqueUsers.length,
        actions: actions.reduce((acc, curr) => {
          acc[curr.actionType] = curr._count.actionType;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Get ledger stats error:', error);
      throw error;
    }
  }
}

module.exports = new LedgerService();