const AWS = require('aws-sdk');
const defaultRegions = require('../helper/default-regions.json');
const types = require('../helper/types.json');
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
			results.Region = region;
			return results;
		})
		.catch(() => {
			//console.error(err, err.stack);
			return null;
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
				results.Region = reg.region;
				return results;
			})
			.catch(err => {
				console.error(err, err.stack);
				return [];
			});

		proms.push(prom);
	}

	return Promise.all(proms);
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
				return r && r.Parameter;
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
		.then(results => results)
		.catch(err => {
			console.error(err, err.stack);
			return [];
		});

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


// {
// 	"display-name": "China (Ningxia)",
// 	"region": "cn-northwest-1",
// 	"endpoint": "ssm.cn-northwest-1.amazonaws.com.cn"
// },
// {
// 	"display-name": "China (Beijing)",
// 	"region": "cn-north-1",
// 	"endpoint": "ssm.cn-north-1.amazonaws.com.cn"
// },


// private AppConfig() {
// 	Parameters = new Dictionary < string, string > ();
// 	var client = new AmazonSimpleSystemsManagementClient(RegionEndpoint.GetBySystemName(Region));

// 	var request = new GetParametersByPathRequest {
// 		Path = ParameterPath,
// 			Recursive = true
// 	};

// 	var task = client.GetParametersByPathAsync(request);
// 	task.Wait();

// 	var paramList = task.Result.Parameters;
// 	foreach(var p in paramList) {
// 		string name = p.Name.Replace(ParameterPath, string.Empty);
// 		string value = p.Value;

// 		if (p.Type == ParameterType.SecureString) {
// 			var paramRequest = new GetParameterRequest {
// 				Name = p.Name,
// 					WithDecryption = true
// 			};
// 			var t = client.GetParameterAsync(paramRequest);
// 			t.Wait();
// 			value = t.Result.Parameter.Value;
// 		}
// 		Parameters.Add(name, value);
// 	}


// }


// public string GetParameter(string name) {
// 	try {
// 		return Parameters[name];
// 	} catch (Exception) {
// 		throw new Exception($ "{name} not found in parameter dictionary check: {Instance.ParameterPath}{name} is in SSM Parameter Store.");
// 	}

// }
