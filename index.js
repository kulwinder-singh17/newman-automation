const config = require('./config.js');

async function execute() {
    await require('./newman.js').executeNewman(config.envFile_name);
}

execute();