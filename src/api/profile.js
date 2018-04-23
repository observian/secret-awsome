const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const os = require('os');

const filePath = process.env.AWS_SHARED_CREDENTIALS_FILE ? process.env.AWS_SHARED_CREDENTIALS_FILE : `${os.homedir()}/.aws/credentials`;

function getProfiles() {
	return fs.readFileAsync(filePath)
		.then(contents => {
			let creds = contents.toString();
			let regex = /\[(.*?)\]/g;
			let res;
			let profiles = [];

			while ((res = regex.exec(creds)) !== null) {
				if (res.length > 1) {
					profiles.push(res[1]);
				}
			}

			if (profiles.length === 0) {
				throw 'No AWS Profiles found';
			}

			return profiles;
		});
}

module.exports.getProfiles = getProfiles;
