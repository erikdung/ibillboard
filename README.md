# Testing application for iBILLBOARD

## Install
Run this command for install all dependencies
```
npm install
```

## Configure
For setting PORT and REDIS DB connection please modify package.json
```
{
  ...,
  "config": {
    "port": 3333,
    "redis_host": "127.0.0.1",
    "redis_port": 6379
  }
}
```

## Run
To start server 
```
npm start
```

## Test
```
npm test
```

