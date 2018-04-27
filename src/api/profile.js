const Promise = require('bluebird');
const os = require('os');
const Reader = require('line-by-line');

function getFilePath() {
	return process.env.AWS_SHARED_CREDENTIALS_FILE ? process.env.AWS_SHARED_CREDENTIALS_FILE : `${os.homedir()}/.aws/credentials`;
}

function getReader() {
	const filePath = getFilePath();

	return new Reader(filePath);
}

function getProfiles() {
	return new Promise((resolve, reject) => {
		const lr = getReader();
		let profileRegex = /\[(.*?)\]/;
		let profiles = [];
		let currentProfile;

		lr.on('error', function (err) {
			reject(err);
		});

		lr.on('line', function (line) {
			let res;
			if ((res = profileRegex.exec(line)) !== null) {
				if (currentProfile) {
					profiles.push(currentProfile);
				}
				currentProfile = {};
				currentProfile.name = res[1];
			} else if ((res = line.match(/^([^=]+)\s*=\s*(.*)$/)) !== null) {
				let key = res[1].toLowerCase().trim();
				// remove ' and " characters if right side of = is quoted
				let value = res[2].match(/^(['"]?)([^\n]*)\1$/m)[2];

				currentProfile[key] = value;
			}
		});

		lr.on('end', function () {
			if (!currentProfile) {
				reject(`No valid AWS Profiles found at "${getFilePath()}"`);
			} else {
				if (currentProfile) {
					profiles.push(currentProfile);
				}
				resolve(profiles);
			}
		});

	});

}

function saveProfiles(data) {

}

module.exports.getProfiles = getProfiles;
module.exports.saveProfiles = saveProfiles;
