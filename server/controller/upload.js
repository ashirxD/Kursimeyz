const { uploadImageBuffer } = require('../utils/s3Upload');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = await uploadImageBuffer({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    res.json({
      message: 'File uploaded successfully',
      url,
    });
  } catch (error) {
    if (
      error.message === 'No file uploaded' ||
      error.message.includes('Only jpg') ||
      error.message.includes('extension')
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes('AWS environment variables')) {
      return res.status(500).json({ message: 'Image upload service is not configured' });
    }

    if (
      error.message.includes('S3 access denied') ||
      error.message.includes('S3 bucket not found') ||
      error.message.includes('Invalid AWS credentials')
    ) {
      return res.status(500).json({ message: error.message });
    }

    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

// Uploads a batch of gallery images, preserving the order they were sent in.
const uploadImages = async (req, res) => {
  try {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const urls = await Promise.all(
      files.map((file) =>
        uploadImageBuffer({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        })
      )
    );

    res.json({
      message: 'Files uploaded successfully',
      urls,
    });
  } catch (error) {
    if (error.message.includes('Only jpg') || error.message.includes('extension')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes('AWS environment variables')) {
      return res.status(500).json({ message: 'Image upload service is not configured' });
    }

    if (
      error.message.includes('S3 access denied') ||
      error.message.includes('S3 bucket not found') ||
      error.message.includes('Invalid AWS credentials')
    ) {
      return res.status(500).json({ message: error.message });
    }

    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Error uploading files' });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
};
