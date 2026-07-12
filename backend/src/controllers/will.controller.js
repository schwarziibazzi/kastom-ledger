const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const pdfService = require('../services/pdf.service');
const transcriptionService = require('../services/transcription.service');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

exports.createWill = async (req, res) => {
  try {
    const { 
      estateId, 
      introduction, 
      introductionAudio,
      executorNotes, 
      executorAudio,
      personalMessages, 
      messagesAudio,
      witnesses 
    } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    // Validate estateId
    if (!estateId) {
      return res.status(400).json({
        success: false,
        message: 'Estate ID is required'
      });
    }

    // Check if user owns the estate
    const estate = await prisma.estate.findFirst({
      where: { id: estateId, ownerId: userId }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    // Check if will already exists
    const existing = await prisma.digitalWill.findUnique({
      where: { estateId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A digital will already exists for this estate'
      });
    }

    // Handle audio data - store as base64 string directly
    // No need to transcribe for now, just store the audio data
    const willData = {
      estateId,
      introduction: introduction || '',
      introductionAudio: introductionAudio || null,
      executorNotes: executorNotes || '',
      executorAudio: executorAudio || null,
      personalMessages: personalMessages || '',
      messagesAudio: messagesAudio || null,
      status: 'draft'
    };

    const will = await prisma.digitalWill.create({
      data: willData
    });

    // Add witnesses if provided
    if (witnesses && witnesses.length > 0) {
      for (const witness of witnesses) {
        await prisma.willWitness.create({
          data: {
            willId: will.id,
            name: witness.name,
            witnessId: witness.id || null,
            status: 'pending'
          }
        });
      }
    }

    await ledgerService.createEntry(
      'DIGITAL_WILL_CREATED',
      sevispassUid,
      {
        estateId,
        willId: will.id,
        hasAudio: !!(introductionAudio || executorAudio || messagesAudio),
        witnessesCount: witnesses?.length || 0
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Digital Will Created',
      'Your digital will has been created successfully.',
      `/will/${will.id}`,
      estateId
    );

    res.status(201).json({
      success: true,
      message: 'Digital will created successfully',
      will
    });
  } catch (error) {
    console.error('Create will error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create digital will',
      error: error.message
    });
  }
};

exports.getWills = async (req, res) => {
  try {
    const userId = req.user.id;

    const wills = await prisma.digitalWill.findMany({
      where: {
        estate: {
          ownerId: userId
        }
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true,
            status: true
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check if PDF exists for each will
    const willsWithPdf = await Promise.all(wills.map(async (will) => {
      const pdf = await prisma.document.findFirst({
        where: {
          estateId: will.estateId,
          category: 'will_audio',
          tags: { has: 'digital_will' }
        }
      });

      return {
        ...will,
        hasPdf: !!pdf,
        pdfUrl: pdf?.fileUrl || null
      };
    }));

    res.json({
      success: true,
      wills: willsWithPdf
    });
  } catch (error) {
    console.error('Get wills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wills',
      error: error.message
    });
  }
};

exports.getWill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const will = await prisma.digitalWill.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: {
              select: {
                name: true,
                sevispassUid: true
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
      return res.status(404).json({
        success: false,
        message: 'Digital will not found'
      });
    }

    // Check if PDF exists
    const pdf = await prisma.document.findFirst({
      where: {
        estateId: will.estateId,
        category: 'will_audio',
        tags: { has: 'digital_will' }
      }
    });

    res.json({
      success: true,
      will: {
        ...will,
        hasPdf: !!pdf,
        pdfUrl: pdf?.fileUrl || null
      }
    });
  } catch (error) {
    console.error('Get will error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch will',
      error: error.message
    });
  }
};

exports.updateWill = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      introduction, 
      introductionAudio,
      executorNotes, 
      executorAudio,
      personalMessages, 
      messagesAudio,
      status 
    } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.digitalWill.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Digital will not found or you do not have permission'
      });
    }

    const will = await prisma.digitalWill.update({
      where: { id },
      data: {
        introduction: introduction !== undefined ? introduction : existing.introduction,
        introductionAudio: introductionAudio !== undefined ? introductionAudio : existing.introductionAudio,
        executorNotes: executorNotes !== undefined ? executorNotes : existing.executorNotes,
        executorAudio: executorAudio !== undefined ? executorAudio : existing.executorAudio,
        personalMessages: personalMessages !== undefined ? personalMessages : existing.personalMessages,
        messagesAudio: messagesAudio !== undefined ? messagesAudio : existing.messagesAudio,
        status: status || existing.status
      }
    });

    await ledgerService.createEntry(
      'DIGITAL_WILL_UPDATED',
      sevispassUid,
      {
        willId: will.id,
        status: will.status
      }
    );

    res.json({
      success: true,
      message: 'Digital will updated successfully',
      will
    });
  } catch (error) {
    console.error('Update will error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update digital will',
      error: error.message
    });
  }
};

exports.deleteWill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.digitalWill.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Digital will not found or you do not have permission'
      });
    }

    // Delete associated PDF
    await prisma.document.deleteMany({
      where: {
        estateId: existing.estateId,
        category: 'will_audio',
        tags: { has: 'digital_will' }
      }
    });

    await prisma.digitalWill.delete({
      where: { id }
    });

    await ledgerService.createEntry(
      'DIGITAL_WILL_DELETED',
      sevispassUid,
      {
        willId: id
      }
    );

    res.json({
      success: true,
      message: 'Digital will deleted successfully'
    });
  } catch (error) {
    console.error('Delete will error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete digital will',
      error: error.message
    });
  }
};

exports.submitWill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.digitalWill.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      },
      include: {
        witnesses: true
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Digital will not found or you do not have permission'
      });
    }

    // Check if minimum witnesses met
    if (existing.witnesses.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least 2 witnesses before submitting'
      });
    }

    const will = await prisma.digitalWill.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date()
      }
    });

    // Generate PDF
    let pdfResult = null;
    try {
      pdfResult = await pdfService.generateDigitalWill(id, userId);
    } catch (pdfError) {
      console.error('PDF Generation Error:', pdfError);
      // Continue even if PDF generation fails
    }

    await ledgerService.createEntry(
      'DIGITAL_WILL_SUBMITTED',
      sevispassUid,
      {
        willId: will.id,
        submittedAt: will.submittedAt,
        hasPdf: !!pdfResult
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Digital Will Submitted',
      `Your digital will has been submitted successfully${pdfResult ? ' and a PDF has been generated.' : '.'}`,
      `/will/${will.id}`,
      existing.estateId
    );

    res.json({
      success: true,
      message: 'Digital will submitted successfully',
      will: {
        ...will,
        pdfGenerated: !!pdfResult,
        pdfUrl: pdfResult?.url || null
      }
    });
  } catch (error) {
    console.error('Submit will error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit digital will',
      error: error.message
    });
  }
};

exports.generateWillPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const will = await prisma.digitalWill.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!will) {
      return res.status(404).json({
        success: false,
        message: 'Digital will not found or you do not have permission'
      });
    }

    // Check if PDF already exists
    const existingPdf = await prisma.document.findFirst({
      where: {
        estateId: will.estateId,
        category: 'will_audio',
        tags: { has: 'digital_will' }
      }
    });

    if (existingPdf) {
      return res.json({
        success: true,
        message: 'PDF already exists',
        pdfUrl: existingPdf.fileUrl
      });
    }

    const result = await pdfService.generateDigitalWill(id, userId);

    await notificationService.createNotification(
      userId,
      'DOCUMENT_UPLOADED',
      'Will PDF Generated',
      'Your digital will PDF has been generated successfully.',
      `/documents`,
      will.estateId
    );

    res.json({
      success: true,
      message: 'PDF generated successfully',
      pdfUrl: result.url
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

exports.downloadWillPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    const filePath = path.join(__dirname, '../../pdfs', path.basename(document.fileUrl));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    res.download(filePath, `Digital_Will_${document.id}.pdf`);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
};