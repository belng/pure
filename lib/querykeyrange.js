exports.queryToKeyrange = function queryToKeyrange (q) {
	return {
		key: q.type + (q.order ? ":" + q.order : "") + juri.encode(q.filter),
		range: juri.encode(q.range.end ?
			[q.range.start, q.range.end] :
			[q.range.start, q.range.before || 0, q.range.after || 0]
		)
	};
}

exports.keyrangeToQuery = function keyrangeToQuery (k, r) {
	r = juri.decode(r);
	
	let ix = k.indexOf("("),
		to = k.substr(0, ix).split(":"),
		q = { type: to[0], range: { start: r[0] }, filter: juri.decode(k.substr(ix)) };
	
	if (to.length > 1) { q.order = to[1]; }
	
	if (r.length === 2) {
		q.range.end = r[1];
	} else {
		if (r[1]) { q.range.before = r[1]; }
		if (r[2]) { q.range.after = r[2]; }
	}
	return q;
}
