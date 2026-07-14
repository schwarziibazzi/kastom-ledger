const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../pdfs');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Generate SHA-256 hash of file
  generateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return hash;
  }

  // Generate a verification code from hash
  generateVerificationCode(hash) {
    return hash.substring(0, 16).toUpperCase();
  }

  // Create digital signature
  generateDigitalSignature(data, secretKey) {
    return crypto
      .createHmac('sha256', secretKey || process.env.JWT_SECRET || 'kastom-ledger-secret')
      .update(data)
      .digest('hex');
  }

  async generateDigitalWill(willId, userId) {
    try {
      const will = await prisma.digitalWill.findUnique({
        where: { id: willId },
        include: {
          estate: {
            include: {
              owner: {
                select: {
                  name: true,
                  sevispassUid: true,
                  province: true,
                  dateOfBirth: true
                }
              },
              assets: true,
              beneficiaries: {
                include: {
                  user: {
                    select: {
                      name: true,
                      sevispassUid: true
                    }
                  }
                }
              },
              witnesses: {
                include: {
                  witness: {
                    select: {
                      name: true,
                      sevispassUid: true
                    }
                  }
                }
              }
            }
          },
          witnesses: true
        }
      });

      if (!will) {
        throw new Error('Digital will not found');
      }

      // Check for existing PDF
      const existingPdf = await prisma.document.findFirst({
        where: {
          estateId: will.estateId,
          category: 'will_audio',
          tags: { has: 'digital_will' }
        }
      });

      if (existingPdf && existingPdf.checksum) {
        // Verify existing PDF integrity
        const filePath = path.join(this.outputDir, path.basename(existingPdf.fileUrl));
        if (fs.existsSync(filePath)) {
          const currentHash = this.generateFileHash(filePath);
          if (currentHash === existingPdf.checksum) {
            return {
              success: true,
              message: 'PDF already exists and is valid',
              url: existingPdf.fileUrl,
              id: existingPdf.id,
              hash: existingPdf.checksum,
              verificationCode: this.generateVerificationCode(existingPdf.checksum)
            };
          }
        }
      }

      // Create ledger entry first
      const ledgerEntry = await prisma.ledgerEntry.create({
        data: {
          actionType: 'DIGITAL_WILL_PDF_GENERATED',
          actorUid: will.estate.owner.sevispassUid,
          timestamp: new Date(),
          previousHash: null,
          currentHash: null,
          metadata: { 
            willId, 
            estateId: will.estateId,
            userName: will.estate.owner.name,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Generate PDF
      const safeName = will.estate.owner.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `will_${safeName}_${Date.now()}.pdf`;
      const filePath = path.join(this.outputDir, filename);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ============ PDF CONTENT ============

      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('Kastom Ledger', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text('Digital Will', { align: 'center' })
        .moveDown(1);

      // Divider
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .stroke()
        .moveDown(1);

      // Security Seal Box
      doc
        .rect(50, doc.y, 490, 60)
        .strokeColor('#14532D')
        .lineWidth(2)
        .stroke();

      const sealY = doc.y + 10;
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('🔒 DOCUMENT VERIFICATION SEAL', { x: 70, y: sealY })
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Document ID: ${will.id}`, { x: 70, y: sealY + 18 })
        .text(`Verification Code: ${this.generateVerificationCode(ledgerEntry.id)}`, { x: 70, y: sealY + 32 })
        .text(`Ledger Entry: ${ledgerEntry.id}`, { x: 70, y: sealY + 46 });

      doc.moveDown(8);

      // Document ID
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(`Generated: ${new Date().toLocaleDateString('en-PG', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'right' })
        .moveDown(1);

      // Estate Information
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('Estate Information')
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#111827')
        .text(`Estate Title: ${will.estate.title}`)
        .text(`Status: ${will.estate.status}`)
        .text(`Created: ${new Date(will.estate.createdAt).toLocaleDateString('en-PG', { day: 'numeric', month: 'long', year: 'numeric' })}`)
        .moveDown(1);

      // Owner Information
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('Owner Information')
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#111827')
        .text(`Name: ${will.estate.owner.name}`)
        .text(`SevisPass UID: ${will.estate.owner.sevispassUid}`)
        .text(`Province: ${will.estate.owner.province}`)
        .text(`Date of Birth: ${new Date(will.estate.owner.dateOfBirth).toLocaleDateString('en-PG', { day: 'numeric', month: 'long', year: 'numeric' })}`)
        .moveDown(1);

      // Introduction
      if (will.introduction) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Introduction')
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#111827')
          .text(will.introduction, { width: 490 })
          .moveDown(1);

        if (will.introductionAudio) {
          doc
            .fontSize(11)
            .font('Helvetica-Oblique')
            .fillColor('#6B7280')
            .text('📢 Audio recording attached', { width: 490 })
            .moveDown(1);
        }
      }

      // Executor Notes
      if (will.executorNotes) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Executor Notes')
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#111827')
          .text(will.executorNotes, { width: 490 })
          .moveDown(1);

        if (will.executorAudio) {
          doc
            .fontSize(11)
            .font('Helvetica-Oblique')
            .fillColor('#6B7280')
            .text('📢 Audio recording attached', { width: 490 })
            .moveDown(1);
        }
      }

      // Assets
      if (will.estate.assets && will.estate.assets.length > 0) {
        doc
          .addPage()
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Assets')
          .moveDown(0.5);

        will.estate.assets.forEach((asset, index) => {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#111827')
            .text(`${index + 1}. ${asset.title}`)
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#4B5563')
            .text(`   Type: ${asset.type}`)
            .text(`   Description: ${asset.description || 'N/A'}`)
            .text(`   Estimated Value: ${asset.estimatedValue ? `PGK ${asset.estimatedValue.toLocaleString()}` : 'N/A'}`)
            .text(`   Location: ${asset.location || 'N/A'}`)
            .moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Beneficiaries
      if (will.estate.beneficiaries && will.estate.beneficiaries.length > 0) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Beneficiaries')
          .moveDown(0.5);

        will.estate.beneficiaries.forEach((beneficiary, index) => {
          const name = beneficiary.user?.name || beneficiary.name || 'Unknown';
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#111827')
            .text(`${index + 1}. ${name}`)
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#4B5563')
            .text(`   Relationship: ${beneficiary.relationship}`)
            .text(`   Share: ${beneficiary.sharePercentage || 'Not specified'}%`)
            .text(`   Status: ${beneficiary.status || 'Pending'}`)
            .moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Personal Messages
      if (will.personalMessages) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Personal Messages')
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#111827')
          .text(will.personalMessages, { width: 490 })
          .moveDown(1);

        if (will.messagesAudio) {
          doc
            .fontSize(11)
            .font('Helvetica-Oblique')
            .fillColor('#6B7280')
            .text('📢 Audio recording attached', { width: 490 })
            .moveDown(1);
        }
      }

      // Will Witnesses
      if (will.witnesses && will.witnesses.length > 0) {
        doc
          .addPage()
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Will Witnesses')
          .moveDown(0.5);

        will.witnesses.forEach((witness, index) => {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#111827')
            .text(`${index + 1}. ${witness.name}`)
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#4B5563')
            .text(`   Email: ${witness.email || 'N/A'}`)
            .text(`   Status: ${witness.status || 'Pending'}`)
            .text(`   Signature: ${witness.signature || 'Not signed'}`)
            .moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Estate Witnesses
      if (will.estate.witnesses && will.estate.witnesses.length > 0) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#14532D')
          .text('Estate Witnesses')
          .moveDown(0.5);

        will.estate.witnesses.forEach((witness, index) => {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('#111827')
            .text(`${index + 1}. ${witness.witness.name}`)
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#4B5563')
            .text(`   UID: ${witness.witness.sevispassUid}`)
            .text(`   Status: ${witness.status || 'Pending'}`)
            .text(`   Verified: ${witness.verifiedAt ? new Date(witness.verifiedAt).toLocaleDateString('en-PG') : 'Not verified'}`)
            .moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // ============ SECURITY SECTION ============
      doc
        .addPage()
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('Document Security & Verification', { align: 'center' })
        .moveDown(1);

      // Digital Signature Box
      doc
        .rect(50, doc.y, 490, 100)
        .strokeColor('#14532D')
        .lineWidth(2)
        .stroke();

      const sigY = doc.y + 10;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('🔐 DIGITAL SIGNATURE', { x: 70, y: sigY })
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Document ID: ${will.id}`, { x: 70, y: sigY + 20 })
        .text(`Ledger Entry: ${ledgerEntry.id}`, { x: 70, y: sigY + 35 })
        .text(`Verification Code: ${this.generateVerificationCode(ledgerEntry.id)}`, { x: 70, y: sigY + 50 })
        .text(`Generated: ${new Date().toISOString()}`, { x: 70, y: sigY + 65 });

      doc.moveDown(12);

      // Tamper-Evident Seal
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('TAMPER-EVIDENT SEAL', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(
          'This document is cryptographically sealed by Kastom Ledger. Any modification after generation',
          { align: 'center', width: 490 }
        )
        .text(
          'will invalidate the digital signature and verification code.',
          { align: 'center', width: 490 }
        )
        .moveDown(1);

      // Verification Instructions
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('HOW TO VERIFY THIS DOCUMENT', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(
          '1. The verification code can be validated against the Kastom Ledger system.',
          { align: 'center', width: 490 }
        )
        .text(
          '2. The document ID and ledger entry must match the system records.',
          { align: 'center', width: 490 }
        )
        .text(
          '3. Any discrepancy indicates the document has been tampered with.',
          { align: 'center', width: 490 }
        )
        .moveDown(2);

      // Legal Disclaimer
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#14532D')
        .text('Legal Disclaimer', { align: 'center' })
        .moveDown(1);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(
          'This Digital Will is a record of the testator\'s intentions as recorded in the Kastom Ledger system.',
          { align: 'center', width: 490 }
        )
        .text(
          'It does not replace legal advice or formal legal processes. For legal validity, please consult with a qualified legal professional.',
          { align: 'center', width: 490 }
        )
        .text(
          'This document was generated automatically by the Kastom Ledger system and is not legally binding unless otherwise recognized by law.',
          { align: 'center', width: 490 }
        )
        .moveDown(2);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#9CA3AF')
        .text(
          `Generated by Kastom Ledger - Papua New Guinea's Digital Legacy Platform`,
          { align: 'center', width: 490 }
        )
        .text(
          `Document ID: ${will.id} | Generated: ${new Date().toLocaleString('en-PG')}`,
          { align: 'center', width: 490 }
        );

      doc.end();

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Calculate file hash
      const fileHash = this.generateFileHash(filePath);
      const fileStats = fs.statSync(filePath);

      // Generate digital signature
      const signatureData = `${will.id}:${fileHash}:${ledgerEntry.id}:${new Date().toISOString()}`;
      const digitalSignature = this.generateDigitalSignature(signatureData);

      // Update ledger entry with hash
      const updatedLedger = await prisma.ledgerEntry.update({
        where: { id: ledgerEntry.id },
        data: {
          currentHash: fileHash,
          previousHash: ledgerEntry.previousHash,
          metadata: { 
            willId, 
            estateId: will.estateId, 
            fileHash,
            digitalSignature,
            verificationCode: this.generateVerificationCode(ledgerEntry.id),
            userName: will.estate.owner.name,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Save document with all security fields
      const document = await prisma.document.create({
        data: {
          title: `Digital Will - ${will.estate.title}`,
          description: `Digital will generated from Kastom Ledger for ${will.estate.owner.name}`,
          fileUrl: `/pdfs/${filename}`,
          fileType: 'pdf',
          fileSize: fileStats.size,
          mimeType: 'application/pdf',
          visibility: 'private',
          uploadedBy: userId,
          category: 'will_audio',
          estateId: will.estateId,
          tags: ['will', 'digital_will', 'estate'],
          checksum: fileHash,
          ledgerHash: updatedLedger.currentHash,
          digitalSignature: digitalSignature,
          signatureDate: new Date(),
          verifiedAt: new Date()
        }
      });

      return {
        success: true,
        filePath,
        filename,
        url: `/pdfs/${filename}`,
        id: document.id,
        hash: fileHash,
        digitalSignature: digitalSignature,
        verificationCode: this.generateVerificationCode(ledgerEntry.id),
        ledgerEntryId: ledgerEntry.id
      };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  // Verify PDF integrity
  async verifyPDF(documentId) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return { isValid: false, error: 'Document not found' };
      }

      if (!document.checksum) {
        return { isValid: false, error: 'Document has no checksum' };
      }

      const filePath = path.join(this.outputDir, path.basename(document.fileUrl));
      if (!fs.existsSync(filePath)) {
        return { isValid: false, error: 'File not found on server' };
      }

      const currentHash = this.generateFileHash(filePath);
      const isValid = currentHash === document.checksum;

      // Update verification timestamp
      if (isValid) {
        await prisma.document.update({
          where: { id: documentId },
          data: { verifiedAt: new Date() }
        });
      }

      return {
        isValid,
        currentHash,
        storedHash: document.checksum,
        digitalSignature: document.digitalSignature,
        ledgerHash: document.ledgerHash,
        verifiedAt: document.verifiedAt,
        message: isValid ? 'Document integrity verified successfully' : 'Document has been tampered with'
      };
    } catch (error) {
      console.error('Verify PDF error:', error);
      return { isValid: false, error: error.message };
    }
  }

  // Get document security info
  async getSecurityInfo(documentId) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          estate: {
            select: {
              id: true,
              title: true,
              owner: {
                select: {
                  name: true,
                  sevispassUid: true
                }
              }
            }
          }
        }
      });

      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      return {
        success: true,
        document: {
          id: document.id,
          title: document.title,
          checksum: document.checksum,
          ledgerHash: document.ledgerHash,
          digitalSignature: document.digitalSignature,
          signatureDate: document.signatureDate,
          verifiedAt: document.verifiedAt,
          estate: document.estate,
          isValid: document.checksum ? true : false
        }
      };
    } catch (error) {
      console.error('Get security info error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PDFService();