export const dollars = (cents, trimDecimalIfZero) => {
	const dollars = cents / 100;

	if (trimDecimalIfZero && dollars % 1 === 0) {
		return `$${dollars.toFixed(0)}`;
	}

	return `$${(cents / 100).toFixed(2)}`;
};