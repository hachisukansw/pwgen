'use strict'
/*
 * Generate a random number n, where 0 <= n < max_num, using
 * window.crypto.getRandomValues possible.
 */
function pw_random_number(max_num)
{
	if (typeof window != "undefined" && window.crypto) {
		let rand_num = window.crypto.getRandomValues(new Uint32Array(1))[0];
		return (rand_num % max_num);
	}
	return Math.floor(Math.random() * max_num);
}