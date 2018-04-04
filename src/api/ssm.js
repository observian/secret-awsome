const AWS = require('aws-sdk');
const defaultRegions = require('../helper/default-regions.json');
const Promise = require('bluebird');

AWS.config.setPromisesDependency(Promise);

function getAllParameters() {
	let proms = [];

	for (let i = 0; i < defaultRegions.regions.length; i++) {
		const reg = defaultRegions.regions[i];
		const ssm = new AWS.SSM({
			region: reg.region
		});

		let params = {
			Path: '/',
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


module.exports.getAllParameters = getAllParameters;


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
