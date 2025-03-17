
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const book = cell.getValue().replace("kambi", "br");
	let line = data.line;
	if (parseInt(line) > 0) {
		line = "+"+line;
	}
	return `
		<div class='evbook-cell'>
			${line}
			<img class='book-img' src='logos/${book}.png' />
		</div>
	`;
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
	return `
		<div class='game-cell'>
			<img class='game-img' src='logos/${SPORT}/${away}.svg' />
			<img class='game-img' src='logos/${SPORT}/${home}.svg' />
		</div>
	`;
}

const lineFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const ou = data.under ? "u" : "o";
	return ou+cell.getValue();
}

const uppercaseFormatter = function(cell, params, rendered) {
	if (cell.getValue()) {
		return cell.getValue().toUpperCase();
	}
	return "";
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