import {
	config,
	SSM,
	SharedIniFileCredentials
} from 'aws-sdk';

import defaultRegions, {
	regions as _regions
} from '../assets/json/default-regions.json';
import types from '../assets/json/types.json';

const Promise = require('bluebird');



config.setPromisesDependency(Promise);

function getParameter(name, region, withDecryption) {
	const ssm = new SSM({
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

function recursiveGet(path, region) {
	let values = [];

	const ssm = new SSM({
		region: region
	});

	let params = {
		Path: path,
		Recursive: true,
		WithDecryption: true
	};

	// Recursive call to getParametersByPath. Recursion continues until NextToken undefined
	function innerget() {
		return ssm.getParametersByPath(params)
			.promise()
			.then(results => {
				params.NextToken = results.NextToken;
				let ret = [];
				if (results.Parameters) {
					for (let i = 0; i < results.Parameters.length; i++) {
						let item = results.Parameters[i];
						item.Region = region;
						ret.push(item);
					}

					values.push(...ret);

					if (!params.NextToken) {
						return values;
					}
				}
				return innerget();
			});
	}

	return Promise.try(innerget);
}

function getParameters(path) {
	let proms = [];

	path = '/';

	for (let i = 0; i < _regions.length; i++) {
		const reg = _regions[i];

		let prom = recursiveGet(path, reg.region);

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

	for (let i = 0; i < _regions.length; i++) {
		let prom = getParameter(name, _regions[i].region, false);
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

	const ssm = new SSM({
		region: region
	});

	let prom = ssm.putParameter(params).promise();

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

function deleteParameters(parameters) {
	let retProm = Promise.try(() => {
		let regionMap = {};
		let proms = [];

		// Separate parameter names into regions
		parameters.forEach(p => {
			if (!regionMap[p.Region]) {
				regionMap[p.Region] = [];
			}

			regionMap[p.Region].push(p.Name);
		});

		Object.keys(regionMap).forEach(region => {
			const ssm = new SSM({
				region: region
			});

			let prom = ssm.deleteParameters({
				Names: regionMap[region]
			}).promise();

			proms.push(prom);
		});

		return Promise.all(proms);

	});

	return retProm;
}

function setCredentials(profileName) {
	let credentials = new SharedIniFileCredentials({
		profile: profileName
	});

	config.credentials = credentials;
}

const _getParameters = getParameters;
export {
	_getParameters as getParameters
};
const _getParameter = getParameter;
export {
	_getParameter as getParameter
};
const _updateParameter = updateParameter;
export {
	_updateParameter as updateParameter
};
const _updateParameters = updateParameters;
export {
	_updateParameters as updateParameters
};
const _deleteParameters = deleteParameters;
export {
	_deleteParameters as deleteParameters
};
const _types = types;
export {
	_types as types
};
const _defaultRegions = defaultRegions;
export {
	_defaultRegions as defaultRegions
};
const _getRegions = getRegions;
export {
	_getRegions as getRegions
};
const _setCredentials = setCredentials;
export {
	_setCredentials as setCredentials
};
