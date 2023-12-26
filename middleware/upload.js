const multer = require('multer')
const path = require('path')  //to get extension from name
const uuid4 = require('uuid').v4



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads")

    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname.toLowerCase())  //name in the system
        cb(null, `${file.fieldname}${uuid4()}${ext}`)

    }

})

//filter file type
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname.toLowerCase())
    if (!ext.match(/jpg|png|jepg/)) {
        cb(new Error('only jpg, png and jepg are allowed'), false)

    } else {
        cb(null, true);
    }

}



const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 6 * 1024 * 1024 }
})



module.exports = upload