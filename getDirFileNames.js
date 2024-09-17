
const fs = require('fs')

getDirFileNames()

function getDirFileNames() {
    const dirNames = fs.readdirSync('./files/movieFiles')

    console.log("dirNames", JSON.stringify(dirNames, undefined, 2));
}