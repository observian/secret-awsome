const octokit = require('@octokit/rest')({
	timeout: 0
});
const Promise = require('bluebird');

const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const pkg = require(`${process.cwd()}/package.json`);

const path = require('path');
const klawSync = require('klaw-sync');
const fileRegex = /\.(zip|rpm|flatpak|deb|exe|dmg)/g;

const MAKEDIR = `${process.cwd()}/out/make`;
const FINALDIR = `${MAKEDIR}/final`;

function handleError(error) {
	console.error(error.message);
	process.exit(1);
}

if (!argv.platform) {
	handleError(new Error('Argument required: --platform'));
} else if (!argv.token) {
	handleError(new Error('Argument required: --token'));
}

octokit.authenticate({
	type: 'oauth',
	token: argv.token
});

// Rename and copy files.
async function createFinalDir(directory) {
	try {
		await fs.ensureDir(directory);
	} catch (err) {
		handleError(err);
	}
}

createFinalDir(FINALDIR);
fs.emptyDirSync(FINALDIR);

const makeFiles = klawSync(MAKEDIR)
	.filter(item => {
		return fileRegex.test(item.path);
	});

let finalFiles = [];

makeFiles.forEach(item => {
	let finalFile = `${FINALDIR}/${pkg.displayName}-${argv.platform}-${pkg.version}${path.extname(item.path)}`;
	fs.copySync(item.path, finalFile);
	finalFiles.push(finalFile);
});

// Check if draft already exists
octokit.repos.getReleases({
		owner: pkg.owner,
		repo: pkg.name,
		per_page: 100
	})
	.then(result => {
		let release = result.data.find(item => {
			return item.tag_name === `v${pkg.version}`;
		});

		return release;
	})
	.then(release => {
		// If release does not already exist, create it
		if (!release) {
			release = octokit.repos.createRelease({
					owner: pkg.owner,
					repo: pkg.name,
					tag_name: `v${pkg.version}`,
					target_commitish: 'master',
					name: `v${pkg.version}`,
					body: `Release of version ${pkg.version}`,
					draft: true,
					prerelease: false
				})
				.then(result => result.data);
		}

		return release;
	})
	.then(release => {
		return Promise.map(finalFiles, filename => {
			let filecontents = fs.readFileSync(`${filename}`);

			return octokit.repos.uploadAsset({
					url: release.upload_url,
					contentType: 'application/octet-stream',
					contentLength: filecontents.length,
					name: path.basename(filename),
					file: filecontents
				})
				.then(() => {
					console.log(`Upload finished: ${path.basename(filename)}`);
				})
				.catch(err => {
					if (/already_exists/g.test(err.message)) {
						console.log(`${path.basename(filename)} already exists. Ignoring.`);
					} else {
						throw err;
					}
				});
		}, {
			concurrency: 1
		});
	})
	.then(() => {
		console.log(`Release Creation Finished for v${pkg.version}`);
	})
	.catch((err) => {
		handleError(err);
	});
