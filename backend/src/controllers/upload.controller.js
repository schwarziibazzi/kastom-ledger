const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { itemId } = req.body;
    const file = req.file;

    const fileRecord = await prisma.fileUpload.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        itemId: itemId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id }
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user has permission (only owner or admin)
    // For simplicity, we'll allow deletion if user has a legacy item with this file
    if (fileRecord.itemId) {
      const item = await prisma.legacyItem.findFirst({
        where: {
          id: fileRecord.itemId,
          ownerUid: req.user.sevispassUid
        }
      });

      if (!item && req.user.sevispassUid !== 'MOCK-UID-005') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this file'
        });
      }
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', fileRecord.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.fileUpload.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};