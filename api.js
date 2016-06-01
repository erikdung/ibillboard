"use strict";

const fs = require("fs")
const path = require("path")
const dbFilePath = path.join(process.cwd(), "data.json")
let queries = []

// check if data.json file exists, if not, create new one
let checkDBFileExists = () => {
    return new Promise((resolve, reject) => {
        fs.stat(dbFilePath, (err, stats) => {
            if (err)
                return fs.writeFile(dbFilePath, '[]', 'utf-8', err => {
                    if (err)
                        return reject(err)
                    resolve()
                })
            resolve()
        })
    })
}

// read file function
let readFile = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(dbFilePath, 'utf-8', (err, data) => {
            if (err)
                return reject(err)
            try {
                resolve(JSON.parse(data))
            } catch (error) {
                reject(error)
            }
        })
    })
}

checkDBFileExists()
    .then(readFile)
    .then(data => {
        queries = data
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })

// append data to data.json file
exports.insertData = data => {
    return new Promise((resolve, reject) => {
        queries.push(data)
        fs.writeFile(dbFilePath, JSON.stringify(queries), 'utf-8', err => {
            if (err)
                return reject(err)
            resolve(data)
        })
    })
}

