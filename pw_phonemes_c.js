'use strict'
/*
 * This program is the JavaScript port of "pw_phonemes.c". by hachisukansw
 */

/*
 *
 * pw_phonemes.c --- generate secure passwords using phoneme rules
 *
 * Copyright (C) 2001,2002 by Theodore Ts'o
 * 
 * This file may be distributed under the terms of the GNU Public
 * License.
 */

const elements = [
	{ str:"a",	 flags:VOWEL },
	{ str:"ae",	 flags:VOWEL | DIPTHONG },
	{ str:"ah",	 flags:VOWEL | DIPTHONG },
	{ str:"ai",	 flags:VOWEL | DIPTHONG },
	{ str:"b",	 flags: CONSONANT },
	{ str:"c",	 flags:CONSONANT },
	{ str:"ch",	 flags:CONSONANT | DIPTHONG },
	{ str:"d",	 flags:CONSONANT },
	{ str:"e",	 flags:VOWEL },
	{ str:"ee",	 flags:VOWEL | DIPTHONG },
	{ str:"ei",	 flags:VOWEL | DIPTHONG },
	{ str:"f",	 flags:CONSONANT },
	{ str:"g",	 flags:CONSONANT },
	{ str:"gh",	 flags:CONSONANT | DIPTHONG | NOT_FIRST },
	{ str:"h",	 flags:CONSONANT },
	{ str:"i",	 flags:VOWEL },
	{ str:"ie",	 flags:VOWEL | DIPTHONG },
	{ str:"j",	 flags:CONSONANT },
	{ str:"k",	 flags:CONSONANT },
	{ str:"l",	 flags:CONSONANT },
	{ str:"m",	 flags:CONSONANT },
	{ str:"n",	 flags:CONSONANT },
	{ str:"ng",	 flags:CONSONANT | DIPTHONG | NOT_FIRST },
	{ str:"o",	 flags:VOWEL },
	{ str:"oh",	 flags:VOWEL | DIPTHONG },
	{ str:"oo",	 flags:VOWEL | DIPTHONG},
	{ str:"p",	 flags:CONSONANT },
	{ str:"ph",	 flags:CONSONANT | DIPTHONG },
	{ str:"qu",	 flags:CONSONANT | DIPTHONG},
	{ str:"r",	 flags:CONSONANT },
	{ str:"s",	 flags:CONSONANT },
	{ str:"sh",	 flags:CONSONANT | DIPTHONG},
	{ str:"t",	 flags:CONSONANT },
	{ str:"th",	 flags:CONSONANT | DIPTHONG},
	{ str:"u",	 flags:VOWEL },
	{ str:"v",	 flags:CONSONANT },
	{ str:"w",	 flags:CONSONANT },
	{ str:"x",	 flags:CONSONANT },
	{ str:"y",	 flags:CONSONANT },
	{ str:"z",	 flags:CONSONANT }
];

const NUM_ELEMENTS = elements.length;

function pw_phonemes(size, pw_flags, pw_number)
{
	if (arguments.length == 1) {
		size = arguments[0].pw_length;
		pw_flags = arguments[0].pwgen_flags;
		pw_number = arguments[0].pw_number;
	}

	let		feature_flags;
	let		ch;
	let		buf = [];

try_again:
	do {
		feature_flags = pw_flags;
		let c = 0;
		let prev = 0;
		let should_be = 0;
		let first = 1;

		should_be = pw_number(2) ? VOWEL : CONSONANT;
		
		while (c < size) {
			let i = pw_number(NUM_ELEMENTS);
			let str = elements[i].str;
			let len = str.length;
			let flags = elements[i].flags;
			/* Filter on the basic type of the next element */
			if ((flags & should_be) == 0)
				continue;
			/* Handle the NOT_FIRST flag */
			if (first && (flags & NOT_FIRST))
				continue;
			/* Don't allow VOWEL followed a Vowel/Dipthong pair */
			if ((prev & VOWEL) && (flags & VOWEL) &&
				(flags & DIPTHONG))
				continue;
			/* Don't allow us to overflow the buffer */
			if (len > size-c)
				continue;

			/*
			* OK, we found an element which matches our criteria,
			* let's do it!
			*/
			for(let j=0;j<str.length;j++) {
				buf[c+j] = str[j];
			}

			/* Handle PW_UPPERS */
			if (pw_flags & PW_UPPERS) {
				if ((first || flags & CONSONANT) &&
					(pw_number(10) < 2)) {
					buf[c] = buf[c].toUpperCase();
					feature_flags &= ~PW_UPPERS; //
				}
			}

			/* Handle the AMBIGUOUS flag */
			if (pw_flags & PW_AMBIGUOUS) {
				buf.length = c + len; /* To make strpbrk() happy */
				if (buf.filter(s=>(pw_ambiguous.includes(s))).length > 0)
						continue;
			}

			c += len;
			
			/* Time to stop? */
			if (c >= size)
				break;
			
			/*
			* Handle PW_DIGITS
			*/
			if (pw_flags & PW_DIGITS) {
				if (!first && (pw_number(10) < 3)) {
					do {
						ch = pw_number(10).toString();
					} while ((pw_flags & PW_AMBIGUOUS) 
						&& pw_ambiguous.includes(ch));
					buf[c++] = ch;
					buf.length = c;
					feature_flags &= ~PW_DIGITS;
					
					first = 1;
					prev = 0;
					should_be = pw_number(2) ?
						VOWEL : CONSONANT;
					continue;
				}
			}
			
			/* Handle PW_SYMBOLS */
			if (pw_flags & PW_SYMBOLS) {
				if (!first && (pw_number(10) < 2)) {
					do {
						ch = pw_symbols[
							pw_number(pw_symbols.length)];
					} while ((pw_flags & PW_AMBIGUOUS) 
						&& pw_ambiguous.includes(ch));
					buf[c++] = ch;
					buf.length = c;
					feature_flags &= ~PW_SYMBOLS;
				}
			}

			/*
			* OK, figure out what the next element should be
			*/
			if (should_be == CONSONANT) {
				should_be = VOWEL;
			} else { /* should_be == VOWEL */
				if ((prev & VOWEL) ||
					(flags & DIPTHONG) ||
					(pw_number(10) > 3))
					should_be = CONSONANT;
				else
					should_be = VOWEL;
			}
			prev = flags;
			first = 0;
		}
	} while (feature_flags & (PW_UPPERS | PW_DIGITS | PW_SYMBOLS));
	return buf.join("");
}
