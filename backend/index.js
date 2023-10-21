const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const path = require('path');
const multer = require('multer');
app.use(cors());

// Define a storage strategy for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images'); // Directory where the files will be saved
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const imgName = `img_${timestamp}.jpeg`;
        cb(null, imgName);
    },
});

const upload = multer({ storage });

app.post('/saveFrame', upload.single('image'), (req, res) => {
    console.log("req");
    res.status(200).json({ message: 'Frame saved successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
