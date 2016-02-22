export default function(strs, ...values) {
	let i = 0, result = '';

	strs.forEach(str => {
		result += str;
		if (i < values.length) result += encodeURIComponent(values[i]);
		i++;
	});

	return result;
}
