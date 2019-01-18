export default (rows, name = "data") => {
	let csvContent = "data:text/csv;charset=utf-8,";
	rows.forEach(rowArray => {
		const row = rowArray.join(`","`);
		csvContent += `"${row}"\r\n`;
	});

	const encodedUri = encodeURI(csvContent);
	const link = document.createElement("a");
	link.setAttribute("href", encodedUri);

	const timeStamp = Math.floor(Date.now() / 1000);
	link.setAttribute("download", `${name}_${timeStamp}.csv`);
	document.body.appendChild(link); // Required for FF

	link.click();

	return true;
};
