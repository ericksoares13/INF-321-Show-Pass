const mongoose = require('mongoose');

let gfs;

const connectDB = async (url) => {
    const conn = await mongoose.connect(url);

    gfs = new mongoose.mongo.GridFSBucket(conn.connection.db, {
        bucketName: "uploads",
    });

    return conn;
};

const getGFS = () => {
    return gfs;
};

module.exports = { connectDB, getGFS };
