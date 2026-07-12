const PDFDocument = require('pdfkit');
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
      });

      if (!will) {
        throw new Error('Digital will not found');
      }

      const filename = `will_${will.estate.owner.name.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(this.outputDir, filename);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

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

      // Document ID
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(`Document ID: ${will.id}`, { align: 'right' })
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
            .text('📢 Audio recording attached (transcript not available)', { width: 490 })
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
            .text('📢 Audio recording attached (transcript not available)', { width: 490 })
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
            .text('📢 Audio recording attached (transcript not available)', { width: 490 })
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

      // Footer
      doc
        .addPage()
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

      // Save to database
      await prisma.document.create({
        data: {
          title: `Digital Will - ${will.estate.title}`,
          description: `Digital will generated from Kastom Ledger for ${will.estate.owner.name}`,
          fileUrl: `/pdfs/${filename}`,
          fileType: 'pdf',
          fileSize: fs.statSync(filePath).size,
          mimeType: 'application/pdf',
          visibility: 'private',
          uploadedBy: userId,
          category: 'will_audio',
          estateId: will.estateId,
          tags: ['will', 'digital_will', 'estate']
        }
      });

      return {
        success: true,
        filePath,
        filename,
        url: `/pdfs/${filename}`
      };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  async getWillPDF(willId, userId) {
    try {
      const document = await prisma.document.findFirst({
        where: {
          estate: {
            ownerId: userId
          },
          category: 'will_audio',
          tags: { has: 'digital_will' }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!document) {
        throw new Error('PDF not found');
      }

      return document;
    } catch (error) {
      console.error('Get PDF error:', error);
      throw error;
    }
  }
}

module.exports = new PDFService();