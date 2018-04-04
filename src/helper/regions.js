const defaultRegions = require(`${process.cwd()}/src/helper/default-regions.json`);

function getRegions() {
	let regions = [];

	defaultRegions.regions.forEach(obj => {
		regions.push(obj.region);
	});

	return regions;
}

module.exports.getRegions = getRegions;
