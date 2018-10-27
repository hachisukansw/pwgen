'use strict'
/*
 * This program is the JavaScript port of "sha1num.c". by hachisukansw
 */

/*
 *
 * sha1num.c --- generate sha1 hash based, pseudo random numbers
 *
 * Copyright (C) 2005 by Olivier Guerrier
 *
 * This file may be distributed under the terms of the GNU Public
 * License.
 */

 let sha1_ctx = {};
let sha1_seed = "";
const sha1_magic = "pwgen";
let sha1sum = new Uint8Array(20);
let sha1sum_idx = 20;
	
function pw_sha1_init(sha1)
{
	if (/^(.+)[:#](.+)$/.test(sha1)) {
		sha1_seed = RegExp.$2;
		sha1 = RegExp.$1;
	} else {
		sha1_seed = sha1_magic;
	}
	sha1_ctx = {};
	sha1sum = new Uint8Array(20);
	sha1sum_idx = 20;
	sha1_starts( sha1_ctx );
	sha1_update( sha1_ctx, sha1);
	return;
}


function pw_sha1_number(max_num)
{
	if (sha1sum_idx>19) {
		sha1sum_idx = 0;
		sha1_update(sha1_ctx, sha1_seed.toUint8Array());
		let ctx = JSON.parse(JSON.stringify(sha1_ctx));
		sha1_finish(ctx, sha1sum );
	}
	let val = Math.floor(( sha1sum[sha1sum_idx++] / 256) * max_num);
	return val;
}
