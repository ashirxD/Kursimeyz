exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the relative path to the uploaded file
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'File uploaded successfully', 
      url: filePath 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};
