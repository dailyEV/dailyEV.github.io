
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const plusMinusFormatter = function(cell) {
	let ev = cell.getValue();
	if (parseFloat(ev) > 0) {
		ev = "+"+ev;
	}
	return ev;
}

const evFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	let ev = cell.getValue();
	if (parseFloat(ev) > 0) {
		ev = "+"+ev;
	}

	return `
		<div class='ev-cell'>
			<span class='ev'>${ev}%</span>
			<span class='ou'>${data.ou}</span>
		</div>
	`;
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";

	if (params.book) {
		const book = params.book.split("-")[0];
		let line = data.bookOdds[book] || 0;
		const lineInt = parseInt(line);
		let implied = -lineInt / (-lineInt + 100);
		if (lineInt > 0 && !line.includes("+")) {
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

	const book = cell.getValue().replace("kambi", "br").replace("-50%", "");
	let line = data.line === undefined ? "-" : data.line;
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
		return data.under ? "No" : "Yes";
	} else if (data.prop == "rfi") {
		return data.under ? "NRFI" : "YRFI";
	} else if (["atgs"].includes(data.prop)) {
		return data.under ? `u${data.prop.toUpperCase()}` : data.prop.toUpperCase();
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
	return `
		<div class='kelly-cell'>
			<div class='kelly'>${kelly.toFixed(2)}u</div>
			<div class='kelly-wager'>$${(kelly * 10).toFixed(2)}</div>
		</div>
	`;
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
	let cond = data.weather["conditions"].toLowerCase().replaceAll(" ", "_");
	if (cond == "breezy_and_mostly_cloudy") {
		cond = "breezy";
	}
	return `
		<img class='wind' src='logos/wind-direction.png' alt='${data.weather["wind dir"]}' title='${data.weather["wind dir"]}' style='${data.weather["transform"]}' />
		<span>${data.weather["wind speed"]}</span>
		<span>${data.weather["wind dir"]}</span>
		<img class='weather' src='logos/weather/${cond}.png' alt='${data.weather["conditions"]}' title='${data.weather["conditions"]}'/>
	`;	
}

const windFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	return getWindHTML(data);
}

const ftFormatter = function(cell, params, rendered) {
	if (!cell.getValue()) {
		return "";
	}
	return cell.getValue()+" ft";
}

const playerFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	if (data.prop == "separator") return "";
	const sport = params.sport;
	let player = title(data.player);
	console.log(cell.getTable().element.id)
	if (MOBILE && cell.getTable().element.id == "table") {
		player = player.split(" ");
		player = player[player.length-1];
	}

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
		} else if (["rfi"].includes(data.prop)) {
			player = "";
		}
	}
	let prop = "";
	if (!["feed", "dingers"].includes(sport)) {
		prop = propFormatter(cell);
	}
	return `
		<div class="player-cell">
			<div class='game-container'>${imgs.join("")}</div>
			${player.replace("TOTAL", "")} ${prop}
		</div>
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
	let sport = params.sport.replace("dingers", "mlb").replace("feed", "mlb");
	return [
		`<img class='game-img away' src='logos/${sport}/${away}.png' alt='${awayAlt}' title='${awayAlt}' />`,
		`<img class='game-img home' src='logos/${sport}/${home}.png' alt='${homeAlt}' title='${homeAlt}' />`
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

function plotMap(data, newX, newY) {
	const colors = newY.map(value => {
		let cond = parseFloat(value) > parseFloat(data.playerHandicap || data.handicap);
		if (data.under) {
			cond = parseFloat(value) < parseFloat(data.playerHandicap || data.handicap);
		}
		return cond ? "rgb(56, 142, 60)" : "rgb(211, 47, 47)";
	});
	const tableData = {
		x: newX,
		y: newY.map(v => v != "0" ? v : 0.25),
		type: "bar",
		text: newY,
		textposition: "inside",
		marker: {
			color: colors
		}
	};
	const layout = {
		title: "Game Logs",
		autosize: true,
		showlegend: false,
		responsive: true,
		plot_bgcolor: '#181a1b',
		paper_bgcolor: "#181a1b",
		font: {
			color: "#e8e6e3"
		},
		width: '100%',
		dragmode: 'pan',
		margin: { l: 0, r: 0, t: 20, b: 20 },
		xaxis: {
			title: "Dates",
			showgrid: false,
			type: "category",
			rangeslider: {
				visible: true
			},
			range: [newX.length-15.6,newX.length-0.5]
		},
		yaxis: {
			showgrid: false,
			tickmode: "linear",
			dtick: 1,
			fixedrange: true,
			showticklabels: false,
			title: {
				text: data.prop.toUpperCase()
			}
		},
		shapes: [
			{
				type: "line",
				//x0: dtSplits[0], x1: dtSplits.at(-1),
				x0: -0.25, x1: newX.length,
				y0: data.playerHandicap || data.handicap, y1: data.playerHandicap || data.handicap,
				line: {
					color: "#5A5A5A",
					dash: "dash"
				}
			}
		]
	};
	Plotly.newPlot("log-chart", [tableData], layout, { responsive: true});
	setTimeout(() => {
		Plotly.Plots.resize("log-chart")
	}, 100);
}