const fs = require('fs')
const path = require('path')

function userRegister(req, res, fields, files, secondLevelFolder){
    console.log('field data: ', fields)
    console.log('files: ', files)
    const phoneNumber = fields.phoneNumber[0]
    const email = fields.email[0]
    const hoTen = fields.hoten[0]
    const dateBirth = fields.dateBirth[0]

    const cmndTruoc = files.cmndTruoc[0]
    const cmndSau = files.cmndSau[0]

    moveFile(cmndTruoc, secondLevelFolder, email)
    moveFile(cmndSau, secondLevelFolder, email)
}

function moveFile(file, secondLevelFolder, destFolder){
    const oldPath = file.path 
    const dirPath = path.join(`public/images/${secondLevelFolder}`, destFolder)
    
    fs.existsSync(dirPath, exists => {
        if(!exists){
            fs.mkdirSync(dirPath)
        }
    })
    
    const newPath = __dirname + '/../public/images/' + secondLevelFolder + '/' + destFolder + '/' + file.originalFilename
    
    fs.copyFileSync(oldPath, newPath)
}

function saveInfoToDb(phone, email, name, birth, idFront, idBack){

}

module.exports = {
    userRegister,
}
