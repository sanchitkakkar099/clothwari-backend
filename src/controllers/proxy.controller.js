const axios = require('axios');
exports.createProxy = async (req, res) => {
    try {
      const imageUrl = req.query.imageUrl; // Get the image URL from query parameters
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];
  
      res.set('Content-Type', contentType);
      res.set('Access-Control-Allow-Origin', '*');
      res.send(response.data);
    // res.send("success");
    } catch (error) {
      console.error('Error fetching image from S3:', error.message);
      res.status(500).send('Failed to fetch image from S3');
    }
}
