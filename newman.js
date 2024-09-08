require('dotenv').config();
const fs = require("fs");
const path = require("path");
const newman = require("newman");
const date = require("date-and-time");

/**
 * Executes a collection using Newman with the provided options.
 * @param {*} options 
 * @returns 
 */
async function newmanRun(options) {
    return new Promise(function (onResolve, onReject) {
        newman.run(options).on("done", function (err, summary) {
            if (err) {
                console.log(`test run failed!${err}`);
                onReject(err);
            }
            onResolve(summary);
        });
    });
}

/**
 * Recursively traverses a directory and fetch names of all files within it.
 * @param {*} dir 
 */
function* walkSync(dir) {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield [path.join(dir, file.name), file.name];
        }
    }
}

/**
 * Returns the time difference between two timestamps in minutes and seconds.
 *
 * @param {number} start - Start time in milliseconds.
 * @param {number} end - End time in milliseconds.
 * @returns {Promise<string>} - Time difference as "minutes.seconds minutes".
 */
async function getTimeDifference(start, end) {
    const timeDiff = Math.abs(end - start);
    const minutes = Math.floor(timeDiff / (60 * 1000));
    const seconds = Math.floor((timeDiff % (60 * 1000)) / 1000);
    const exeTimeDiff = `${minutes}.${seconds} minutes`;
    return exeTimeDiff;
}

/**
 * Executing Postman collections and generating reports.
 * @param {*} envFileName 
 * @returns 
 */
async function executeNewman(envFileName) {
    const filePathList = [];
    const fileNameList = [];
    var summary_json = [];

    for (const filePath of walkSync(__dirname + '\\collections\\')) {
        if (
            filePath[1] !== envFileName &&
            filePath[1].endsWith(".json") &&
            !filePath[0].includes("node_modules") &&
            !(filePath[1] === "package.json" || filePath[1] === "package-lock.json")
        ) {
            filePathList.push(filePath[0]);
            fileNameList.push(filePath[1]);
        }
    }
    const dateValue = date.format(new Date(), "DD-MM-YYYY", 'Asia/Kolkata');
    const month = new Date(date.format(new Date(), "Y, M, D")).toLocaleString('default', { month: 'long' });
    const reportFolder = `${month}/${dateValue}`;

    for (let i = 0; i < fileNameList.length; i++) {
        const envPath = path.join(__dirname, "environment", envFileName);
        const options = {
            collection: require(filePathList[i]),
            environment: require(envPath),
            reporters: ['htmlextra', 'cli'],
            reporter: {
                htmlextra: {
                    export: `./report/${reportFolder}/` + fileNameList[i].split(".")[0].concat('.html')
                }
            },
            insecure: true, // allow self-signed certs, required in postman too
            timeoutscript: 1800000 // Script time out
        };
        try {
            let collection_name = fileNameList[i].split(".")[0];
            console.log('\n\nExecuting: ' + collection_name);
            let report_link = `${reportFolder}/` + collection_name.concat('.html');
            const resp = await newmanRun(options);
            var collection_result = {
                Collection: collection_name,
                RequestsTotal: JSON.stringify(resp.run.stats.requests.total),
                RequestFailed: JSON.stringify(resp.run.stats.requests.failed),
                AssertionsFailed: JSON.stringify(resp.run.stats.assertions.failed),
                TestScriptTotal: JSON.stringify(resp.run.stats.testScripts.total),
                TestScriptFailed: JSON.stringify(resp.run.stats.testScripts.failed),
                Report_link: report_link
            };
            summary_json.push(collection_result);
            const execution_time = await getTimeDifference(resp.run.timings.started, resp.run.timings.completed);
            console.log('Execution Time: ' + execution_time);
            console.log(collection_result);
        } catch (error) {
            console.log(`Error in ${fileNameList[i]}`);
            throw error;
        }
    }
    return "Done";
}

module.exports = { executeNewman };