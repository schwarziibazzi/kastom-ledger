const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const pdfService = require('../services/pdf.service');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// ==================== FOLDERS ====================

exports.createFolder = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const userId = req.user.id;

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        parentId: parentId || null,
        ownerId: userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create folder',
      error: error.message
    });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const userId = req.user.id;

    const folders = await prisma.folder.findMany({
      where: { 
        ownerId: userId,
        parentId: null
      },
      include: {
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                audioFiles: true
              }
            }
          }
        },
        _count: {
          select: {
            documents: true,
            audioFiles: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      folders
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folders',
      error: error.message
    });
  }
};

exports.getFolderContents = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await prisma.folder.findFirst({
      where: { id, ownerId: userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        audioFiles: {
          orderBy: { createdAt: 'desc' }
        },
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                audioFiles: true
              }
            }
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Get folder contents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folder contents',
      error: error.message
    });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const folder = await prisma.folder.updateMany({
      where: { id, ownerId: userId },
      data: { name, description }
    });

    if (folder.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      message: 'Folder updated successfully'
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update folder',
      error: error.message
    });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await prisma.folder.findFirst({
      where: { id, ownerId: userId },
      include: {
        documents: true,
        audioFiles: true,
        children: {
          include: {
            documents: true,
            audioFiles: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission'
      });
    }

    const allDocs = [...folder.documents, ...folder.children.flatMap(c => c.documents)];
    const allAudio = [...folder.audioFiles, ...folder.children.flatMap(c => c.audioFiles)];

    for (const doc of allDocs) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(doc.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    for (const audio of allAudio) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(audio.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.document.deleteMany({
      where: { folderId: { in: [id, ...folder.children.map(c => c.id)] } }
    });

    await prisma.audioFile.deleteMany({
      where: { folderId: { in: [id, ...folder.children.map(c => c.id)] } }
    });

    await prisma.folder.deleteMany({
      where: { parentId: id }
    });

    await prisma.folder.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete folder',
      error: error.message
    });
  }
};

// ==================== DOCUMENTS ====================

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, folderId, estateId, assetId, visibility, tags } = req.body;
    const userId = req.user.id;

    let fileType = 'file';
    const mimeType = req.file.mimetype;
    if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType.startsWith('audio/')) fileType = 'audio';
    else if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType.includes('word') || mimeType.includes('document')) fileType = 'document';

    const fileUrl = `/uploads/${req.file.filename}`;

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, ownerId: userId }
      });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found or you do not have permission'
        });
      }
    }

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
        folderId: folderId || null,
        estateId: estateId || null,
        assetId: assetId || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : []
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

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, search, type } = req.query;

    const where = {
      uploadedBy: userId
    };

    if (folderId) {
      where.folderId = folderId;
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
        folder: {
          select: {
            id: true,
            name: true
          }
        },
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
      documents
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

exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        uploadedBy: userId
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        },
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
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

exports.moveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;
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

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, ownerId: userId }
      });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found or you do not have permission'
        });
      }
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { folderId: folderId || null }
    });

    res.json({
      success: true,
      message: 'Document moved successfully',
      document: updated
    });
  } catch (error) {
    console.error('Move document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move document',
      error: error.message
    });
  }
};

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

// ==================== AUDIO FILES ====================

exports.saveAudioFile = async (req, res) => {
  try {
    const { title, description, folderId, relatedTo, relatedId, audioData } = req.body;
    const userId = req.user.id;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'No audio data provided'
      });
    }

    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    const fileSize = buffer.length;

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, ownerId: userId }
      });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found or you do not have permission'
        });
      }
    }

    const audioFile = await prisma.audioFile.create({
      data: {
        title: title || 'Audio Recording',
        description: description || '',
        fileUrl,
        fileSize,
        uploadedBy: userId,
        folderId: folderId || null,
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

exports.getAudioFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, relatedTo } = req.query;

    const where = { uploadedBy: userId };

    if (folderId) {
      where.folderId = folderId;
    }

    if (relatedTo) {
      where.relatedTo = relatedTo;
    }

    const audioFiles = await prisma.audioFile.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      },
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
        message: 'Audio file not found or you do not have permission'
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

// ==================== STATS & RECENT ====================

exports.getRecentFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const [documents, audioFiles] = await Promise.all([
      prisma.document.findMany({
        where: { uploadedBy: userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.audioFile.findMany({
        where: { uploadedBy: userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);

    const allFiles = [
      ...documents.map(d => ({ ...d, type: 'document' })),
      ...audioFiles.map(a => ({ ...a, type: 'audio' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, limit);

    res.json({
      success: true,
      files: allFiles
    });
  } catch (error) {
    console.error('Get recent files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent files',
      error: error.message
    });
  }
};

exports.getStorageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [docCount, audioCount, docs, audio] = await Promise.all([
      prisma.document.count({ where: { uploadedBy: userId } }),
      prisma.audioFile.count({ where: { uploadedBy: userId } }),
      prisma.document.findMany({
        where: { uploadedBy: userId },
        select: { fileSize: true }
      }),
      prisma.audioFile.findMany({
        where: { uploadedBy: userId },
        select: { fileSize: true }
      })
    ]);

    const totalSize = [...docs, ...audio].reduce((sum, f) => sum + f.fileSize, 0);

    res.json({
      success: true,
      stats: {
        documentCount: docCount,
        audioCount: audioCount,
        totalFiles: docCount + audioCount,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
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

// ==================== VERIFICATION ====================

exports.verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { uploadedBy: userId },
          { estate: { ownerId: userId } }
        ]
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission'
      });
    }

    const result = await pdfService.verifyPDF(id);

    res.json({
      success: true,
      verification: result
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message
    });
  }
};

exports.getDocumentSecurityInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { uploadedBy: userId },
          { estate: { ownerId: userId } }
        ]
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission'
      });
    }

    const result = await pdfService.getSecurityInfo(id);

    res.json({
      success: true,
      securityInfo: result
    });
  } catch (error) {
    console.error('Get security info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security info',
      error: error.message
    });
  }
};