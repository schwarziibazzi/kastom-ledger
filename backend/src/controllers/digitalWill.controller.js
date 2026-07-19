const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const pdfService = require('../services/pdf.service');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Helper function to save audio file and create document record
async function saveAudioToDocuments(audioData, title, description, userId, estateId, willId) {
  try {
    if (!audioData) return null;
    
    // Extract base64 data
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate filename
    const filename = `audio_${willId}_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, filename);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file
    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `/uploads/${filename}`;
    const fileSize = buffer.length;
    
    // Create document record
    const document = await prisma.document.create({
      data: {
        title: title || 'Audio Recording',
        description: description || `Audio recording from Digital Will`,
        fileUrl,
        fileType: 'audio',
        fileSize,
        mimeType: 'audio/wav',
        visibility: 'private',
        uploadedBy: userId,
        category: 'will_audio',
        estateId: estateId || null,
        tags: ['audio', 'digital_will', 'verification'],
        checksum: crypto.createHash('sha256').update(buffer).digest('hex')
      }
    });
    
    return document;
  } catch (error) {
    console.error('Save audio to documents error:', error);
    return null;
  }
}

// Create Digital Will with audio saved to documents
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

    if (!estateId) {
      return res.status(400).json({
        success: false,
        message: 'Estate ID is required'
      });
    }

    const estate = await prisma.estate.findFirst({
      where: { id: estateId, ownerId: userId }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    const existing = await prisma.digitalWill.findUnique({
      where: { estateId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A digital will already exists for this estate'
      });
    }

    // Save audio files to documents BEFORE creating will
    let introDoc = null;
    let execDoc = null;
    let msgDoc = null;
    
    if (introductionAudio) {
      introDoc = await saveAudioToDocuments(
        introductionAudio,
        `Introduction Audio - ${estate.title}`,
        `Introduction audio recording for ${estate.owner?.name || 'Owner'}`,
        userId,
        estateId,
        null // willId not created yet
      );
    }
    
    if (executorAudio) {
      execDoc = await saveAudioToDocuments(
        executorAudio,
        `Executor Notes Audio - ${estate.title}`,
        `Executor notes audio recording for ${estate.owner?.name || 'Owner'}`,
        userId,
        estateId,
        null
      );
    }
    
    if (messagesAudio) {
      msgDoc = await saveAudioToDocuments(
        messagesAudio,
        `Personal Messages Audio - ${estate.title}`,
        `Personal messages audio recording for ${estate.owner?.name || 'Owner'}`,
        userId,
        estateId,
        null
      );
    }

    // Create the will with references to audio documents
    const will = await prisma.digitalWill.create({
      data: {
        estateId,
        introduction: introduction || '',
        introductionAudio: introductionAudio || null,
        introductionAudioDocId: introDoc?.id || null,
        executorNotes: executorNotes || '',
        executorAudio: executorAudio || null,
        executorAudioDocId: execDoc?.id || null,
        personalMessages: personalMessages || '',
        messagesAudio: messagesAudio || null,
        messagesAudioDocId: msgDoc?.id || null,
        status: 'draft'
      }
    });

    // Update audio documents with willId
    if (introDoc) {
      await prisma.document.update({
        where: { id: introDoc.id },
        data: { tags: ['audio', 'digital_will', 'verification', `will_${will.id}`] }
      });
    }
    if (execDoc) {
      await prisma.document.update({
        where: { id: execDoc.id },
        data: { tags: ['audio', 'digital_will', 'verification', `will_${will.id}`] }
      });
    }
    if (msgDoc) {
      await prisma.document.update({
        where: { id: msgDoc.id },
        data: { tags: ['audio', 'digital_will', 'verification', `will_${will.id}`] }
      });
    }

    // Add witnesses
    if (witnesses && Array.isArray(witnesses) && witnesses.length > 0) {
      for (const witness of witnesses) {
        if (!witness.name) continue;
        await prisma.willWitness.create({
          data: {
            willId: will.id,
            name: witness.name,
            email: witness.email || null,
            relationship: witness.relationship || null,
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
        audioDocs: {
          introduction: introDoc?.id || null,
          executor: execDoc?.id || null,
          messages: msgDoc?.id || null
        },
        witnessesCount: witnesses?.length || 0
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Digital Will Created',
      `Your digital will has been created successfully. Audio recordings are saved in Documents.`,
      `/will/${will.id}`,
      estateId
    );

    res.status(201).json({
      success: true,
      message: 'Digital will created successfully with audio saved to Documents',
      will: {
        ...will,
        audioDocuments: {
          introduction: introDoc,
          executor: execDoc,
          messages: msgDoc
        }
      }
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

// Submit Will - includes PDF generation
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
    }

    // Check if audio documents exist and update their status
    const audioDocs = await prisma.document.findMany({
      where: {
        tags: { has: `will_${will.id}` },
        category: 'will_audio'
      }
    });

    for (const doc of audioDocs) {
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          tags: [...doc.tags, 'submitted', 'verified']
        }
      });
    }

    await ledgerService.createEntry(
      'DIGITAL_WILL_SUBMITTED',
      sevispassUid,
      {
        willId: will.id,
        submittedAt: will.submittedAt,
        hasPdf: !!pdfResult,
        audioCount: audioDocs.length
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Digital Will Submitted',
      `Your digital will has been submitted successfully${pdfResult ? ' and a PDF has been generated.' : '.'} ${audioDocs.length} audio recordings are saved in Documents.`,
      `/will/${will.id}`,
      existing.estateId
    );

    res.json({
      success: true,
      message: pdfResult ? 'Digital will submitted successfully with PDF' : 'Digital will submitted but PDF generation failed',
      will: {
        ...will,
        pdfGenerated: !!pdfResult,
        pdfUrl: pdfResult?.url || null,
        pdfId: pdfResult?.id || null,
        audioDocuments: audioDocs
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

// Get will with audio documents
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
        witnesses: true
      }
    });

    if (!will) {
      return res.status(404).json({
        success: false,
        message: 'Digital will not found'
      });
    }

    // Get audio documents
    const audioDocuments = await prisma.document.findMany({
      where: {
        tags: { has: `will_${will.id}` },
        category: 'will_audio'
      }
    });

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
        pdfUrl: pdf?.fileUrl || null,
        pdfId: pdf?.id || null,
        audioDocuments
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