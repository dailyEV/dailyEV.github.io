
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	return data.line+" "+cell.getValue().replace("kambi", "br").toUpperCase();
}

const teamFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	return `<img class='team-img' src='${cell.getValue()}' />`;
}

const gameFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const game = cell.getValue();
	const away = game.split(" @ ")[0];
	const home = game.split(" @ ")[1];
	return `<img class='team-img' src='${cell.getValue()}' />`;
}

const lineFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const ou = data.under ? "u" : "o";
	return ou+cell.getValue();
}

const uppercaseFormatter = function(cell, params, rendered) {
	return cell.getValue().toUpperCase();
}

function title(str) {
	return str.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

const titleFormatter = function(cell, params, rendered) {
	return title(cell.getValue());
}

const dtMutator = function(value) {
	return value.slice(0, -5);
}

function fetchFile(file, cb) {
	const url = "https://api.github.com/repos/zhecht/playerprops/contents/static/"+file;
	fetch(url, {
		headers: { "Accept": "application/vnd.github.v3.raw" }
	}).then(response => response.json()).then(res => {
		cb(res)
	}).catch(err => console.log(err));
}