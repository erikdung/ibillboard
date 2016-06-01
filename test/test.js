"use strict";
const assert = require('chai').assert
const request = require('request')
const fs = require('fs')
const _ = require('underscore')
const redis = require('redis')
const client = redis.createClient()
const async = require('async')

describe('Listen only to route /track', () => {
    it('It should return 200 on GET /track', done => {
        request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track`, (err, response, body) => {
            if (err || !response || response.statusCode !== 200)
                throw err
            done()
        })
    })
    it('It should return 404 on GET /', done => {
        request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/`, (err, response, body) => {
            if (err)
                throw err
            if (response.statusCode === 404)
                done()
        })
    })
})

describe('It should save query parameters on GET /track', () => {
    it('It should save query parameters to data.json', done => {
        request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?test=saving`, (err, response, body) => {
            if (err)
                throw err
            let data = _.last(JSON.parse(fs.readFileSync("./data.json", 'utf-8')))
            if (_.isEqual(data, { test: "saving" }))
                done()
            else
                throw "not equals" + data
        })
    })
    it('It should append query parameters to data.json', done => {
        let data = JSON.parse(fs.readFileSync("./data.json", 'utf-8'))
        request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?foo=bar&lorem=ipsum`, (err, response, body) => {
            if (err)
                throw err
            let appendedData = JSON.parse(fs.readFileSync("./data.json", 'utf-8'))
            if (_.isEqual(data.length + 1, appendedData.length))
                done()
            else
                throw "not equals"
        })
    })
})

describe('redis', () => {
    it('It should increment key "count" in redis DB when query parameters contain "count"', done => {
        client.get('count', function (err, value) {
            if (err)
                throw err
            request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=1`, function (err, response, body) {
                if (err) throw err
                client.get('count', function (err, newValue) {
                    if (_.isEqual(parseInt(value) + 1, parseInt(newValue))) {
                        done()
                    }
                    else {
                        throw 'not equals'
                    }
                })
            })
        })
    })
    it('It should increment in redis DB', done => {
        client.get('count', function (err, value) {
            if (err)
                throw err
            async.parallel([
                callback => {
                    request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=1`, function (err, response, body) {
                        if (err)
                            return callback(err)
                        callback()
                    })
                },
                callback => {
                    request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=2`, function (err, response, body) {
                        if (err)
                            return callback(err)
                        callback()
                    })
                },
                callback => {
                    request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=3`, function (err, response, body) {
                        if (err)
                            return callback(err)
                        callback()
                    })
                },
                callback => {
                    request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=4`, function (err, response, body) {
                        if (err)
                            return callback(err)
                        callback()
                    })
                },
                callback => {
                    request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=5`, function (err, response, body) {
                        if (err)
                            return callback(err)
                        callback()
                    })
                }
            ], function (err) {
                if (err)
                    throw err
                client.get('count', function (err, newValue) {
                    if (_.isEqual(parseInt(value) + 5, parseInt(newValue))) {
                        done()
                    }
                    else {
                        throw 'not equals'
                    }
                })
            })
        })
    })
})

describe('performance', function() {
    this.timeout(50000)
    it("Testing 1000x requests, 5 concurencies", done => {
        var q = async.queue(function (task, callback) {
            request.get(`http://127.0.0.1:${process.env.npm_package_config_port}/track?count=1000`, function (err, response, body) {
                if (err || !response || response.statusCode !== 200)
                    return callback(err || true)
                callback()
            })
        }, 5)

        let error
        // assign a callback
        q.drain = function () {
            if (error)
                throw 'Unsuccesful requests ' + error
            done()
        }

        // add some items to the queue
        for (var i = 0; i < 1000; i++) {
            q.push({}, function (err) {
                if (err)
                    error += 1
            })
        }
    })
})