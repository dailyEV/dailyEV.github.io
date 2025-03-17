
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

const plusMinusFormatter = function(cell) {
	let ev = cell.getValue();
	if (parseFloat(ev) > 0) {
		ev = "+"+ev;
	}
	return ev;
}

const propFormatter = function(cell) {
	const data = cell.getRow().getData();
	const ou = data.under ? "u" : "o";
	let prop = `${ou}${data.playerHandicap} ${data.prop.toUpperCase()}`;
	if (["atgs"].includes(data.prop)) {
		return data.prop.toUpperCase();
	}
	return prop;
}

const teamFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	return `<img class='team-img' src='${cell.getValue()}' />`;
}

const playerFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const sport = params.sport;
	const team = "det";
	const imgs = getGameImgs(data, params);
	return `
		<div class='game-container'>${imgs.join("")}</div>
		${title(data.player)}
	`
}

function getGameImgs(data, params) {
	const away = data.game.split(" @ ")[0];
	const home = data.game.split(" @ ")[1];
	return [
		`<img class='game-img away' src='logos/${params.sport}/${away}.png' />`,
		`<img class='game-img home' src='logos/${params.sport}/${home}.png' />`
	];
}

const gameFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const gameImgs = getGameImgs(data, params);
	return `
		<div class='game-cell'>
			${gameImgs.join("")}
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