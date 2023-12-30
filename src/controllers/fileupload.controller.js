//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");

const { spawn } = require('child_process');
const path = require('path');
const fs = require("fs");
const util = require('util');

const spawnPromise = util.promisify(spawn);


exports.extractimage_from_pdf_python = async (filepath, outputpath, fileId, filename) => {
    try {
        let file = await runPythonScript(filepath, outputpath, fileId, filename)
        let filext = path.extname(`${file}`)

        if (`${file}`.indexOf(filename) != -1) {
            await dbMethods.updateOne({
                collection: dbModels.FileUpload,
                query: { _id: fileId },
                update: {
                    pdf_extract_img: 'http://' + process.env.HOST + `/uploads/pdf_img/${filename}.png`
                }
            })
        }
        return true
    } catch (error) {
        console.log(error);
        return helperUtils.errorRes("Internal Server Error", false, HttpStatus.BAD_REQUEST);
    }
}




async function runPythonScript(filepath, outputpath, fileId, filename) {
    try {
        const pythonScriptPath = path.join(__dirname, "../utils/pyscript.py");
        const pdfPath = filepath;
        const outputFolder = outputpath;

        const pythonProcess = spawn('python', [pythonScriptPath, pdfPath, outputFolder, filename]);

        const stdoutPromise = new Promise((resolve) => {
            pythonProcess.stdout.on('data', (file_path1) => {
                console.log(`Python Script Output stdout: ${file_path1}`);
                // setTimeout(resolve, 5000, `${file_path1}`, fileId);
                resolve(file_path1)
            });
        });

        const stderrPromise = new Promise((resolve, reject) => {
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error from Python Script: ${data}`);
                if (data) reject(false);

            });
            resolve(true)
        });

        const closePromise = new Promise((resolve) => {
            pythonProcess.on('close', (code) => {
                console.log(code);
                console.log(`Python Script Exited with Code: ${code}`);
                resolve(code);
            });
        });

        console.log("result before")
        let result = await Promise.all([stdoutPromise, stderrPromise, closePromise]);
        let extract_data = result[0]
        console.log(`${extract_data}`)
        // if (fs.existsSync(`${extract_data}`))
        //     console.log("result", result)
        return extract_data
    } catch (error) {
        console.error(error);
        throw error;
    }
}

