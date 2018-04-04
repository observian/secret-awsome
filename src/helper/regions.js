const defaultRegions = require('./default-regions.json');

function getRegions() {
	let regions = [];

	defaultRegions.regions.forEach(obj => {
		regions.push(obj.region);
	});

	return regions;
}

module.exports.getRegions = getRegions;
