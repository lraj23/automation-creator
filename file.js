import fs from "node:fs";
import { join } from "node:path";

const dataFilePath = join(import.meta.dirname, "automation-creator.json");
let automationCreator = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

// credit: https://stackoverflow.com/a/7574273
const cloneObj = obj => {
	if (obj == null || typeof (obj) != "object") return obj;
	let clone = new obj.constructor();
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			clone[key] = cloneObj(obj[key]);
		}
	}
	return clone;
};

const saveState = data => fs.writeFileSync(dataFilePath, JSON.stringify(automationCreator = cloneObj(data), null, "\t"));

const getAutomationCreator = () => cloneObj(automationCreator);

export {
	saveState,
	getAutomationCreator
};