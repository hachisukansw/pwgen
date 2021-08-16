'use strict'
/*
 * This program is the JavaScript port of "pw_rand.c". by hachisukansw
 */

/*
 *
 * pw_rand.c --- generate completely random (and hard to remember)
 * 	passwords
 *
 * Copyright (C) 2001,2002 by Theodore Ts'o
 * 
 * This file may be distributed under the terms of the GNU Public
 * License.
 */
const pw_digits = "0123456789";
const pw_uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const pw_lowers = "abcdefghijklmnopqrstuvwxyz";
const pw_symbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
//const pw_ambiguous_list = ["B8G6I1l0OQDS5Z2", "B8G6bI1l7i0OoQDSs5Zz29qgadCcKkUuVvXx"];
const pw_ambiguous_list = ["B8G6I1l0OQDS5Z2-_~'`\".,:;|/\\(){}[]<>", "B8G6bI1l7i0OoQDSs5Zz29qgadCcKkUuVvXx-_~^'`\".,:;@$&?*+|/\\(){}[]<>"];
let pw_ambiguous = pw_ambiguous_list[0];
const pw_vowels = "01aeiouyAEIOUY";
const pw_yomi = {
	"a": "エイ",
	"b": "ビー",
	"c": "シー",
	"d": "ディー",
	"e": "イー",
	"f": "エフ",
	"g": "ジー",
	"h": "エイチ",
	"i": "アイ",
	"j": "ジェイ",
	"k": "ケイ",
	"l": "エル",
	"m": "エム",
	"n": "エヌ",
	"o": "オー",
	"p": "ピー",
	"q": "キュー",
	"r": "アール",
	"s": "エス",
	"t": "ティー",
	"u": "ユー",
	"v": "ブイ",
	"w": "ダブリュー",
	"x": "エックス",
	"y": "ワイ",
	"z": "ゼット",
}

function pw_rand(size, pw_flags, pw_number)
{
	if (arguments.length == 1) {
		size = arguments[0].pw_length;
		pw_flags = arguments[0].pwgen_flags;
		pw_number = arguments[0].pw_number;
	}

	let chars = "";
	if (pw_flags & PW_DIGITS) {
		chars += pw_digits;
	}
	if (pw_flags & PW_UPPERS) {
		chars += pw_uppers;
	}
	chars += pw_lowers;
	if (pw_flags & PW_SYMBOLS) {
		chars += pw_symbols;
	}

	let len = chars.length;
	let feature_flags;
	let buf;
try_again:
	do {
		feature_flags = pw_flags;
		buf = []
		while (buf.length < size) {
			let ch = chars[pw_number(len)];
			if ((pw_flags & PW_AMBIGUOUS) && pw_ambiguous.includes(ch))
				continue;
			if ((pw_flags & PW_NO_VOWELS) && pw_vowels.includes(ch))
				continue;
			buf.push(ch);
			if (pw_digits.includes(ch))
				feature_flags &= ~PW_DIGITS;
			if (pw_uppers.includes(ch))
				feature_flags &= ~PW_UPPERS;
			if (pw_symbols.includes(ch))
				feature_flags &= ~PW_SYMBOLS;
		}
	} while (feature_flags & (PW_UPPERS | PW_DIGITS | PW_SYMBOLS))
	return buf.join("");
}	
