
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";

	if (params.book) {
		return `
			<div class='evbook-cell'>
				<span>${data.bookOdds[params.book]}</span>
				<span class='evbook-implied'>20%</span>
				<img class='book-img' src='logos/${params.book}.png' alt='${params.book}' title='${params.book}' />
			</div>
		`;
	}

	const book = cell.getValue().replace("kambi", "br");
	let line = data.line;
	let lineInt = parseInt(line);
	let implied = -lineInt / (-lineInt + 100);
	if (lineInt > 0) {
		line = "+"+line;
		implied = 100 / (lineInt + 100);
	}
	implied = parseInt(implied * 100);
	return `
		<div class='evbook-cell'>
			<span class='evbook-odds'>${line}</span>
			<span class='evbook-implied'>${implied}%</span>
			<img class='book-img' src='logos/${book}.png' alt='${book}' title='${book}' />
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
	if (["playoffs", "roty", "mvp", "division"].includes(data.prop)) {
		if (data.under) {
			return "No";
		} else {
			return "Yes";
		}
	} else if (["atgs", "rfi"].includes(data.prop)) {
		if (data.under) {
			return `u${data.prop.toUpperCase()}`
		} else {
			return data.prop.toUpperCase();
		}
	} else if (data.prop.includes("ml")) {
		return `${data.prop.toUpperCase()}`;
	} else if (data.prop.includes("total")) {
		return `${ou}${data.handicap}`;
	} else if (data.prop.includes("spread")) {
		let v = parseFloat(data.handicap);
		if (data.under) {
			v *= -1;
		}
		return v < 0 ? v : `+${v}`;
	}

	let prop = `${ou}${data.playerHandicap}`;
	if (!["team_wins"].includes(data.prop)) {
		prop += ` ${convertProp(data.prop)}`;
	}
	return prop;
}

const kellyFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	let dec = data.line / 100;
	if (data.line < 0) {
		dec = 100 / data.line;
	}
	const kelly = parseFloat(data.ev) / Math.abs(dec) / 4;
	return `${kelly.toFixed(2)}u`;
}

const teamFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	return `<img class='team-img' src='${cell.getValue()}' alt='${data.team}' title='${data.team}' />`;
}

const dtFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	if (!cell.getValue()) return "";
	const d = new Date(cell.getValue()+" 10:00");
	return d.toLocaleDateString("en-US", {
		month: "short", day: "numeric", year: "2-digit"
	}).replace(", ", " '");
}

function getWindHTML(data) {
	if (!data.weather || !data.weather["wind speed"]) {
		return "";
	}
	if (data.weather["wind"].includes("Roof")) {
		return `Roof`;
	}
	return `
		<img class='wind' src='logos/wind-direction.png' alt='${data.weather["wind dir"]}' title='${data.weather["wind dir"]}' style='margin-left:0.15rem;${data.weather["transform"]}' />
		<span style='margin: 0 0.25rem;'>${data.weather["wind speed"]}</span>
		<span>${data.weather["wind dir"]}</span>
		<img class='weather' src='logos/weather/${data.weather["conditions"].toLowerCase().replaceAll(" ", "_")}.png' alt='${data.weather["conditions"]}' title='${data.weather["conditions"]}' style='margin-left:0.15rem;' />
	`;	
}

const windFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	return getWindHTML(data);
}

const playerFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	const sport = params.sport;
	let player = title(data.player);

	if (sport.includes("futures")) {
		if (data.prop == "team_wins") {
			return player.toUpperCase()+" Wins";
		} else if (["playoffs", "roty", "mvp", "division"].includes(data.prop)) {
			return `${player.toUpperCase()} ${title(data.prop)}`;
		}
		return player;
	}

	const team = SPORT == "ncaab" ? data.teamId : data.team;
	const imgs = getGameImgs(data, params);

	if (player == "") {
		player = data.prop.replace("_", " ").toUpperCase();
		if (data.prop.includes("ml")) {
			const g = SPORT == "ncaab" ? title(data.game) : data.game.toUpperCase();
			player = data.under ? g.split(" @ ")[1] : g.split(" @ ")[0];
		} else if (data.prop == "total" && SPORT == "ncaab") {
			player = `Total (${data.gameId.toUpperCase()})`;
		} else if (data.prop.includes("away_total") || data.prop.includes("home_total")) {
			player = `${team.toUpperCase()} ${data.prop.replace("home_", "").replace("away_", "").toUpperCase()}`;
		} else if (data.prop.includes("spread")) {
			player = `${team.toUpperCase()} ${data.prop.toUpperCase()}`;
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
	let awayAlt = data.game.split(" @ ")[0].toUpperCase();
	let homeAlt = data.game.split(" @ ")[1].toUpperCase();
	if (SPORT == "ncaab") {
		awayAlt = title(awayAlt);
		homeAlt = title(homeAlt);
	}
	return [
		`<img class='game-img away' src='logos/${params.sport.replace("dingers", "mlb")}/${away}.png' alt='${awayAlt}' title='${awayAlt}' />`,
		`<img class='game-img home' src='logos/${params.sport.replace("dingers", "mlb")}/${home}.png' alt='${homeAlt}' title='${homeAlt}' />`
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
	if (!str) return "";
	return str.split(" ")
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

const chartFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const content = document.createElement("span");
	if (!cell.getValue()) {
		return "";
	}
	const values = cell.getValue().split(",").slice(-15);

	//if (params.invert) {
	//	values = values.map(val => val * -1);
	//}

	content.classList.add(params.type);
	content.innerHTML = values.join(",");

	const options = {
		width: 145
	}

	options.fill = function(value) {
		const line = data.playerHandicap || data.handicap || 0;
		let cond = parseFloat(value) > parseFloat(line);
		if (data.under) {
			cond = parseFloat(value) < parseFloat(line);
		}
		return cond ? "rgb(56, 142, 60)" : "rgb(211, 47, 47)"
	}

	rendered(function(){
		peity(content, params.type, options);
	});
	return content;
}