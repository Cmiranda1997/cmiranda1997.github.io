// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(bodyParser.json());

app.post('/sendEstimate', upload.single('pdf'), (req, res) => {
    const { clientName, email } = req.body;
    const pdf = req.file;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
            user: 'yourSendGridUsername',
            pass: 'yourSendGridPassword'
        }
    });

    const mailOptions = {
        from: 'youremail@example.com',
        to: email,
        subject: 'Your Estimate',
        text: `Estimate for ${clientName}\n\nPlease find the attached estimate.`,
        attachments: [
            {
                filename: 'estimate.pdf',
                content: pdf.buffer
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.send('Estimate sent: ' + info.response);
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
