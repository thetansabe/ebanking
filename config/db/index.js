const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewURLParser: true,
            useUnifiedTopology: true
        });
        console.log('Connect to database successfully');
    }
    catch(err) {
        console.log('Error connecting to database');
    }
}

module.exports = { connect };