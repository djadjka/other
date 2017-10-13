const fs = require('fs');
const download = require('download');
const rp = require('request-promise');
const cheerio = require('cheerio');
const xlsx = require('node-xlsx');
const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`./input.xlsx`));
let xlsxData = [
    ['Date', 'IR', 'SerialNum', 'OA size']
];

let promises = [];

function workWithDocks(ir) {
    let options = {
        uri: 'http://tsdr.uspto.gov/iastatusview/ir' + ir,
        transform: (body) => {
            return cheerio.load(body);
        }
    };
    return rp(options).then(($) => {
        let promisesabc = [];
        let serialNumbers = $('#summary > div.single.table > div > div.value > a').toArray();
        for (let i = 0; i < serialNumbers.length; i++) {
            let serialNumber = $(serialNumbers[i]).text();
            promisesabc.push(checkStatus(serialNumber).then((status) => {
                if (status) {
                    return getCaseID(serialNumber).then((caseID) => {
                        return downloadFile(serialNumber, caseID, ir);
                    });
                } else {
                    return Promise.resolve();
                }
            }));
        }
        return Promise.all(promisesabc);
    });
}

function checkStatus(serialNumber) {
    let options = {
        uri: 'http://tsdr.uspto.gov/statusview/sn' + serialNumber,
        transform: (body) => {
            return cheerio.load(body);
        }
    };
    return rp(options).then(($) => {
        return $('#summary > div:nth-child(6) > div:nth-child(1) > div.value.single').text() === `
	           				A non-final Office action has been sent (issued) to the applicant.  This is a letter from the examining attorney requiring additional information and/or making an initial refusal.  The applicant must respond to this Office action.  To view all documents in this file, click on the Trademark Document Retrieval link at the top of this page.
               `;
    });
}

function getCaseID(serialNumber) {
    let options = {
        uri: 'http://tsdr.uspto.gov/docsview/sn' + serialNumber,
        transform: (body) => {
            return cheerio.load(body);
        }
    };
    return rp(options).then(($) => {
        let caseID = null;
        $('#docResultsTbody tr').each((i, elem) => {
            if ($(elem).children().eq(2).text().indexOf('Offc Action Outgoing') !== -1) {
                caseID = $(elem).children().last().text();
            }
        })
        return caseID;
    });
}

function downloadFile(serialNumber, caseID, ir) {
    return download('https://tsdrsec.uspto.gov/ts/cd/casedoc/sn' + serialNumber + '/OOA' + caseID + '/download.pdf')
        .then((data) => {
            let date = (new Date).toISOString().
            replace(/T/, ' '). // replace T with a space
            replace(/\..+/, '');
            return new Promise((resolve) => {
                fs.writeFile(serialNumber + '.pdf', data, () => {
                    xlsxData.push([date, ir, serialNumber, data.length / 1000]);
                    resolve();
                })
            });
        })
}

workSheetsFromBuffer[0].data.forEach((cell) => {
    promises.push(workWithDocks(cell[0]));
});
Promise.all(promises).then(() => {
    var buffer = xlsx.build([{
        name: "list",
        data: xlsxData
    }]);
    fs.writeFileSync("output.xlsx", buffer)
})