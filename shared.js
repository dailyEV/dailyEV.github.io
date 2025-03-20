
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
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

function convertProp(prop) {
	prop = prop
		.replace("single", "1b").replace("double", "2b").replace("triple", "3b")
		.replace("pts+", "p+").replace("+ast", "+a").replace("+reb", "+r")
	return prop.toUpperCase();
}

const propFormatter = function(cell) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	const ou = data.under ? "u" : "o";
	let prop = `${ou}${data.playerHandicap} ${convertProp(data.prop)}`;
	if (["atgs", "rfi"].includes(data.prop)) {
		if (data.under) {
			return `u${data.prop.toUpperCase()}`
		} else {
			return data.prop.toUpperCase();
		}
	} else if (data.prop == "ml") {
		return "ML";
	} else if (data.prop.includes("total")) {
		return `${ou}${data.handicap}`;
	} else if (data.prop.includes("spread")) {
		return `${ou}${data.handicap}`;
	}
	return prop;
}

const teamFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	return `<img class='team-img' src='${cell.getValue()}' />`;
}

const playerFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	const sport = params.sport;
	const team = "det";
	const imgs = getGameImgs(data, params);
	let player = title(data.player);
	if (player == "") {
		player = data.prop.replace("_", " ").toUpperCase();
		if (data.prop == "ml") {
			const g = SPORT == "ncaab" ? title(data.game) : data.game.toUpperCase();
			player = data.under ? g.split(" @ ")[1] : g.split(" @ ")[0];
		}
	}
	return `
		<div class='game-container'>${imgs.join("")}</div>
		${player}
	`
}

function getGameImgs(data, params) {
	let away = data.awayTeamId || data.game.split(" @ ")[0];
	let home = data.homeTeamId || data.game.split(" @ ")[1];
	return [
		`<img class='game-img away' src='logos/${params.sport}/${away}.png' />`,
		`<img class='game-img home' src='logos/${params.sport}/${home}.png' />`
	];
}

const gameFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	const gameImgs = getGameImgs(data, params);
	return `
		<div class='game-cell'>
			${gameImgs.join("")}
		</div>
	`;
}

const lineFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
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