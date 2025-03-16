
const percentFormatter = function(cell, params, rendered) {
	return cell.getValue()+"%";
}

const evBookFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	return data.line+" "+cell.getValue().replace("kambi", "br").toUpperCase();
}

const lineFormatter = function(cell, params, rendered) {
	const data = cell.getRow().getData();
	const ou = data.under ? "u" : "o";
	return ou+cell.getValue();
}

const uppercaseFormatter = function(cell, params, rendered) {
	return cell.getValue().toUpperCase();
}

const titleFormatter = function(cell, params, rendered) {
	return cell.getValue().split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}