const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECT_LINK, {
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