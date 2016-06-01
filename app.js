"use strict";

const express = require('express')
const app = express()
const api = require("./api")
const redis = require("./redis_api")

// setting route /track
app.get('/track', (req, res) => {
    if (Object.keys(req.query).length > 0) {
        api.insertData(req.query)
            .then(redis.increment)
            .then(() => {
                res.send("Query saved")
            })
            .catch((err) => {
                res.status(400).send(err)
            })
    }
    else {
        res.send("Hello")
    }
})

// start server
app.listen(process.env.npm_package_config_port, () => {
    console.log('Example app listening on port ' + process.env.npm_package_config_port)
})