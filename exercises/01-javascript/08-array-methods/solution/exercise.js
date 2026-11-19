// Еталонне рішення кати 01-08. Відкривай лише після власної спроби.

export function getFailedTitles(results) {
	return results.filter((result) => result.status === 'failed').map((result) => result.title);
}

export function totalDuration(results) {
	return results.reduce((sum, result) => sum + result.durationMs, 0);
}

export function countByStatus(results) {
	return results.reduce(
		(counts, result) => {
			counts[result.status] = counts[result.status] + 1;
			return counts;
		},
		{ passed: 0, failed: 0, skipped: 0 },
	);
}

export function findSlowest(results) {
	if (results.length === 0) {
		return undefined;
	}
	return results.reduce((slowest, result) => (result.durationMs > slowest.durationMs ? result : slowest));
}

export function isRunGreen(results) {
	return results.length > 0 && results.every((result) => result.status !== 'failed');
}

export function byTag(results, tag) {
	return results.filter((result) => result.tags.includes(tag));
}

export function sortByDurationDesc(results) {
	return results.slice().sort((a, b) => b.durationMs - a.durationMs);
}
