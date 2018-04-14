const AWS = require('aws-sdk');
const defaultRegions = require('../assets/json/default-regions.json');
const types = require('../assets/json/types.json');
const Promise = require('bluebird');

AWS.config.setPromisesDependency(Promise);

function getParameter(name, region, withDecryption) {
	const ssm = new AWS.SSM({
		region: region
	});

	let params = {
		Name: name,
		WithDecryption: withDecryption
	};

	let prom = ssm.getParameter(params)
		.promise()
		.then(results => {
			let ret = results.Parameter;
			ret.Region = region;

			return ret;
		});

	return prom;
}

function getParameters(path) {
	let proms = [];

	path = '/';

	for (let i = 0; i < defaultRegions.regions.length; i++) {
		const reg = defaultRegions.regions[i];
		const ssm = new AWS.SSM({
			region: reg.region
		});

		let params = {
			Path: path,
			Recursive: true,
			WithDecryption: false
		};

		let prom = ssm.getParametersByPath(params)
			.promise()
			.then(results => {
				let ret = [];
				if (results.Parameters) {
					for (let i = 0; i < results.Parameters.length; i++) {
						let item = results.Parameters[i];
						item.Region = reg.region;
						ret.push(item);
					}
				}
				return ret;
			})
			.catch(err => {
				console.error(err, err.stack);
				return [];
			});

		proms.push(prom);
	}

	let retProm = Promise.all(proms)
		.then(nested => {
			// Flatten nested array
			return [].concat.apply([], nested);
		});

	return retProm;
}

function getRegions(name) {
	let proms = [];
	let regions = [];

	for (let i = 0; i < defaultRegions.regions.length; i++) {
		let prom = getParameter(name, defaultRegions.regions[i].region, false);
		proms.push(prom);
	}

	return Promise.all(proms)
		.then(results => {
			return results.filter(r => {
				return r && r.Name;
			});
		})
		.then(myvals => {
			myvals.forEach((val) => {
				regions.push(val.Region);
			});
			return regions;
		});
}

function updateParameter(name, type, value, region) {
	let params = {
		Name: name,
		Type: type,
		Value: value,
		Overwrite: true
	};

	const ssm = new AWS.SSM({
		region: region
	});


	let prom = ssm.putParameter(params)
		.promise()
		.then(results => results);

	return prom;
}

function updateParameters(name, type, value, regions) {
	let proms = [];

	for (let i = 0; i < regions.length; i++) {
		const reg = regions[i];

		let prom = updateParameter(name, type, value, reg);
		proms.push(prom);
	}

	return Promise.all(proms);
}

module.exports.getParameters = getParameters;
module.exports.getParameter = getParameter;
module.exports.updateParameter = updateParameter;
module.exports.updateParameters = updateParameters;
module.exports.types = types;
module.exports.defaultRegions = defaultRegions;
module.exports.getRegions = getRegions;
