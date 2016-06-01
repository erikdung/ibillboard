"use strict";
const redis = require('redis')
// setting client for redis
const client = redis.createClient({
    host: process.env.npm_config_redis_host,
    port: process.env.npm_config_redis_port
})

client.on('connect', () => {
    console.log('Connected to Redis')
    // check if key "count" exists
    client.exists('count', (err, reply) => {
        if (err) {
            console.log(err)
            return process.exit(1)
        }
        if (reply === 1) {
            console.log('Key "count" already exists.')
        } else {
            // if not, create key "count"
            console.log('Key "count" doesn\'t exist')
            client.set('count', '1', (err, reply) => {
                if (err) {
                    console.log(err)
                    process.exit(1)
                }
                else {
                    console.log('Key "count" created.')
                }
            })
        }
    })
})

// increment key "count"
exports.increment = query => {
    return new Promise((resolve, reject) => {
        if (query.count)
            client.incr('count', (err, reply) => {
                if (err)
                    return reject(err)
                resolve(reply)
            })
        else
            resolve()
    })
}

// on process exit quit connection to redis
process.on('exit', code => {
    client.quit()
})

