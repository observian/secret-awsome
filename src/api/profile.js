const Promise = require('bluebird');
const fs = require('fs');
Promise.promisifyAll(fs);

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
			if (currentProfile) {
				profiles.push(currentProfile);
			}
			resolve(profiles);
		});

	});

}

function saveProfiles(data) {
	let lines = [];
	for (let i = 0; i < data.length; i++) {
		const profile = data[i];

		lines.push(`[${profile.name}]`);
		lines.push(`aws_access_key_id=${profile.aws_access_key_id}`);
		lines.push(`aws_secret_access_key=${profile.aws_secret_access_key}`);
		if (profile.region) {
			lines.push(`region=${profile.region}`);
		}
		if (profile.output) {
			lines.push(`output=${profile.output}`);
		}
		lines.push('');
	}

	return fs.writeFileAsync(getFilePath(), lines.join('\n'));
}

module.exports.getProfiles = getProfiles;
module.exports.saveProfiles = saveProfiles;
