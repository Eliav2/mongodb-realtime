
---

# MongoDB Realtime

![GitHub License](https://img.shields.io/github/license/Eliav2/mongodb-realtime-listener)
![npm Version](https://img.shields.io/npm/v/mongodb-realtime-listener)

**MongoDB Realtime** is an experimental library that aims to provide real-time capabilities for MongoDB, inspired by the functionalities of Firebase and react-firebase-hooks. 
The end goal is to enable real-time updates from your MongoDB instance to the client through your NodeJS server.

This is implemented by using MongoDB's [Change Streams](https://docs.mongodb.com/manual/changeStreams/) and [Change Events](https://docs.mongodb.com/manual/reference/change-events/) on the db-->server and websockets from the server<-->client.
This library consists of 3 packages:
 - [@mongodb-realtime/server](packages/server/readme.md): A NodeJS server that listens to MongoDB's change streams and emits events to the client.
 - [@mongodb-realtime/client-react](packages/mongodb-realtime/client/readme.md): A React integration for the client.
 - 

**Please Note: This project is currently in active development and is considered experimental. It may not be production-ready.**

## Features

- **Real-time Updates**: Instantly receive updates when documents in your MongoDB collection change.


## Getting Started

### Server

#### Installation

Install the package via npm:

```bash
npm install @mongodb-realtime/server
```

#### Usage

```javascript
TODO
```

### Client

#### Installation

Install the package via npm:

```bash
npm install @mongodb-realtime/client
```

#### Usage

```javascript
TODO
```


For more detailed usage instructions and options, refer to the [Documentation](https://github.com/Eliav2/mongodb-realtime-listener/wiki).

## Contributing

As this project is experimental, you would probably encounter bugs and issues. If you do, please report them in the [Issues](
PRs are welcome!


## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- This project trys to mimic how Firebase and react-firebase-hooks work.

---

