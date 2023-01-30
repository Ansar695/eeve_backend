const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SG_API_KEY)

const sendEmail = async(req, res) => {
    console.log("email")

    sgMail.setApiKey(process.env.SG_API_KEY)
    const msg = {
    to: 'engineeransar988@gmail.com', // Change to your recipient
    from: 'engineeransar988@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: `<strong>and easy to do anywhere, even with Node.js</strong>`,
    }
    sgMail
    .send(msg)
    .then((response) => {
        console.log(response)
        console.log('Email sent')
        res.send("Email sent")
    })
    .catch((error) => {
        console.error(error)
        res.send("Email not sent")
    })
}

const userReg = async (req, res) => {
    const{email, password, name, sur_name} = req.body
    console.log("apikey", apikey)
    try {
        if(!email || 
           !password || 
           !name || 
           !sur_name) return res.status(404).json(
                {status: 404, message: "Please enter all fields properly"}
            )
        const isExist = await userModel.findOne({email})
        if(isExist) return res.status(404).json({status: 400, message: "User already exist with such credentials"})
        const result = new userModel(req.body);
        const data = await result.save();
        if(!data) return res.status(400).json({status: 404, message: "Data not saved please try again"})

        const html = `<strong>verify your email <a href="http://localhost:3000/login">Verify Now</a></strong>`

        sgMail.setApiKey(apikey)
        const msg = {
        to: "ansarsaeed988@gmail.com", // Change to your recipient
        from: 'ansarsaeed988@gmail.com', // Change to your verified sender
        subject: `Email verification from EEVE Project`,
        text: 'and easy to do anywhere, even with Node.js',
        html: `<strong>verify your email <a href="http://localhost:3000/login">Verify Now</a></strong>`,
        }
        sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
            res.status(200).send({
                status: 200, 
                message: "Login suceessfull",
                verifyLink: html
            })
        })
        .catch((error) => {
            console.error(error.message)
            res.json("Email not sent")
        })
    } catch (error) {
        res.status(400).json(error);
        console.error(error);
    }
};

const userSignin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) return res.status(404).json({status: 404, message: "Please enter all fields properly"})
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "This User does not exist" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        const token = await user.generateAuthToken();

        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 300000000),
            httpOnly: true,
        });

        user.password = undefined;
        user.tokens = undefined;

        if (isMatch) {
            res.status(200).json({ user, token });
        } else {
            res.status(404).json({ message: "Invalid Details" });
        }
    } catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
};

const savedUserDesignerImage = async (req, res) => {
    const { d_image, description, title } = req.body;
    console.log(req.body.description);
    let savedImage
    savedImage = false
    if(!req.user) return res.status(404).json({status:404, message: "user authentication failed."})
    const result = await userModel.findOne({ email: req.user.email });
    result&&result.saved.length>0&&result.saved.map((sav) => {
        if(sav.userId===req.user.Id){
            savedImage = true
        }
    })
    
    if(!savedImage){
        const saved = await result.saveSignleDesignerImage(
            d_image,
            description,
            title,
            userId
        );
        console.log(saved);
        if (saved) {
            res.status(200).json({ message: "Image Saved" });
        } else {
            res.status(404).json({ message: "Image Not Saved" });
        }
    }else{
        res.status(200).json({ message: "Image already Saved" });
    }
};

const savedUserPartImage = async (req, res) => {
    const { d_image, description, title } = req.body;
    console.log(req.body.description);
    const result = await userModel.findOne({ email: req.user.email });
    const saved = await result.saveSignleDesignerImage(
        d_image,
        description,
        title
    );
    console.log(saved);
    if (saved) {
        res.status(200).json({ message: "Image Saved" });
    } else {
        res.status(404).json({ message: "Image Not Saved" });
    }
};

module.exports = {
    sendEmail,
    userReg,
    userSignin,
    savedUserDesignerImage,
    savedUserPartImage,
};
