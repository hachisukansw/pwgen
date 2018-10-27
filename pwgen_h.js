'use strict'
/*
 * This program is the JavaScript port of "pwgen.h". by hachisukansw
 */

/*
 *
 * pwgen.h --- header file for password generator
 *
 * Copyright (C) 2001,2002 by Theodore Ts'o
 * 
 * This file may be distributed under the terms of the GNU Public
 * License.
 */
/*
 * Flags for the pw_element
 */
const CONSONANT	= 0x0001
const VOWEL		= 0x0002
const DIPTHONG	= 0x0004
const NOT_FIRST	= 0x0008
/*
 * Flags for the pwgen function
 */
const PW_DIGITS		= 0x0001	/* At least one digit */
const PW_UPPERS		= 0x0002	/* At least one upper letter */
const PW_SYMBOLS	= 0x0004
const PW_AMBIGUOUS	= 0x0008
const PW_NO_VOWELS	= 0x0010
