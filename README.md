# web-mock
better web mock server for rest API / websocket | mock server 用于模拟响应 rest API / websocket  

## usage
```
git clone https://github.com/postor/web-mock.git
cd web-mock
docker compose up
```
- mock server on port 3000 
- connection manage UI on port 3020
- data storage server on port 1234

rest mock example:
- `curl http://localhost:3000/test/rest/api` will get result `{ message: 'Mock response' }`
- now you can see it on

## build docker

```
docker compose build
```

## dev

```
npm -w db run dev
npm -w backend run dev
npm -w frontend run dev
```
