const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// ==================== UPLOAD DOCUMENT ====================

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, category, estateId, assetId, visibility } = req.body;
    const userId = req.user.id;

    // Determine file type
    let fileType = 'file';
    const mimeType = req.file.mimetype;
    if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType.startsWith('audio/')) fileType = 'audio';
    else if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType.includes('word') || mimeType.includes('document')) fileType = 'document';

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await prisma.document.create({
      data: {
        title: title || req.file.originalname,
        description: description || '',
        fileUrl,
        fileType,
        fileSize: req.file.size,
        mimeType,
        visibility: visibility || 'private',
        uploadedBy: userId,
        estateId: estateId || null,
        assetId: assetId || null,
        category: category || 'general',
        tags: []
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// ==================== GET DOCUMENTS ====================

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, search, type } = req.query;

    const where = { uploadedBy: userId };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.fileType = type;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        },
        asset: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get audio files separately
    const audioFiles = await prisma.audioFile.findMany({
      where: { uploadedBy: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Get all files with category
    const allFiles = [
      ...documents.map(d => ({ ...d, type: 'document' })),
      ...audioFiles.map(a => ({ ...a, type: 'audio' }))
    ];

    // Group by category for stats
    const categories = {};
    allFiles.forEach(file => {
      const cat = file.category || 'general';
      if (!categories[cat]) categories[cat] = 0;
      categories[cat]++;
    });

    res.json({
      success: true,
      documents,
      audioFiles,
      allFiles,
      categories,
      stats: {
        total: allFiles.length,
        byCategory: categories
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// ==================== GET BY CATEGORY ====================

exports.getDocumentsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;

    const documents = await prisma.document.findMany({
      where: {
        uploadedBy: userId,
        category: category
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      documents,
      category
    });
  } catch (error) {
    console.error('Get documents by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// ==================== SAVE AUDIO FROM WILL ====================

exports.saveAudioFile = async (req, res) => {
  try {
    const { title, description, category, audioData, relatedTo, relatedId } = req.body;
    const userId = req.user.id;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'No audio data provided'
      });
    }

    // Save audio file
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    const fileSize = buffer.length;

    const audioFile = await prisma.audioFile.create({
      data: {
        title: title || 'Audio Recording',
        description: description || '',
        fileUrl,
        fileSize,
        uploadedBy: userId,
        category: category || 'will_audio',
        relatedTo: relatedTo || null,
        relatedId: relatedId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Audio saved successfully',
      audioFile
    });
  } catch (error) {
    console.error('Save audio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save audio',
      error: error.message
    });
  }
};

// ==================== GET AUDIO FILES ====================

exports.getAudioFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const where = { uploadedBy: userId };
    if (category) {
      where.category = category;
    }

    const audioFiles = await prisma.audioFile.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      audioFiles
    });
  } catch (error) {
    console.error('Get audio files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audio files',
      error: error.message
    });
  }
};

// ==================== DOWNLOAD DOCUMENT ====================

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: { id, uploadedBy: userId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(document.fileUrl));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, document.title || 'document');
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// ==================== DELETE DOCUMENT ====================

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: { id, uploadedBy: userId }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', path.basename(document.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// ==================== DELETE AUDIO ====================

exports.deleteAudioFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const audioFile = await prisma.audioFile.findFirst({
      where: { id, uploadedBy: userId }
    });

    if (!audioFile) {
      return res.status(404).json({
        success: false,
        message: 'Audio file not found'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(audioFile.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.audioFile.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Audio deleted successfully'
    });
  } catch (error) {
    console.error('Delete audio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete audio',
      error: error.message
    });
  }
};

// ==================== GET STORAGE STATS ====================

exports.getStorageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [docCount, audioCount, docs, audio] = await Promise.all([
      prisma.document.count({ where: { uploadedBy: userId } }),
      prisma.audioFile.count({ where: { uploadedBy: userId } }),
      prisma.document.findMany({
        where: { uploadedBy: userId },
        select: { fileSize: true, category: true }
      }),
      prisma.audioFile.findMany({
        where: { uploadedBy: userId },
        select: { fileSize: true, category: true }
      })
    ]);

    const totalSize = [...docs, ...audio].reduce((sum, f) => sum + f.fileSize, 0);

    // Group by category
    const categoryStats = {};
    [...docs, ...audio].forEach(f => {
      const cat = f.category || 'general';
      if (!categoryStats[cat]) categoryStats[cat] = { files: 0, size: 0 };
      categoryStats[cat].files++;
      categoryStats[cat].size += f.fileSize;
    });

    res.json({
      success: true,
      stats: {
        totalFiles: docCount + audioCount,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        documentCount: docCount,
        audioCount: audioCount,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storage stats',
      error: error.message
    });
  }
};
// Save audio file to documents
exports.saveAudioToDocuments = async (audioData, title, description, userId, estateId) => {
  try {
    // Save audio file to uploads folder
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    const fileSize = buffer.length;

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: title || 'Audio Recording',
        description: description || '',
        fileUrl,
        fileType: 'audio',
        fileSize,
        mimeType: 'audio/wav',
        visibility: 'private',
        uploadedBy: userId,
        category: 'will_audio',
        estateId: estateId || null,
        tags: ['audio', 'digital_will']
      }
    });

    return document;
  } catch (error) {
    console.error('Save audio to documents error:', error);
    return null;
  }
};