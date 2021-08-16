'use strict'
/*
 * This program is the JavaScript port of "pwgen.c". by hachisukansw
 */

/*
 *
 * pwgen.c --- generate secure passwords
 *
 * Copyright (C) 2001,2002 by Theodore Ts'o
 * 
 * This file may be distributed under the terms of the GNU Public
 * License.
 */
/* Program parameters set via getopt */

const pwgen_options = {
		"--alt-phonics": "-a",
		"--capitalize": "-c",
		"--numerals": "-n",
		"--symbols": "-y",
		"--num-passwords":  "-N",
		"--secure": "-s",
		"--help": "-h",
		"--no-numerals": "-0",
		"--no-capitalize": "-A",
		"--sha1": "-H",
		"--ambiguous": "-B",
		"--no-vowels": "-v",
		"--length": "-L",
		"--ex-ambiguous": "-BB",
}

const usage_en = ""
	+"Usage: pwgen [ OPTIONS ] [ pw_length ] [ num_pw ]\n\n"
	+"Options supported by pwgen:\n"
	+"  -c or --capitalize\n"
	+"\tInclude at least one capital letter in the password\n"
	+"  -A or --no-capitalize\n"
	+"\tDon't include capital letters in the password\n"
	+"  -n or --numerals\n"
	+"\tInclude at least one number in the password\n"
	+"  -0 or --no-numerals\n"
	+"\tDon't include numbers in the password\n"
	+"  -y or --symbols\n"
	+"\tInclude at least one special symbol in the password\n"
	+"  -s or --secure\n"
	+"\tGenerate completely random passwords\n"
	+"  -B or --ambiguous\n"
	+"\tDon't include ambiguous characters in the password\n"
	+"  -BB or --ex-ambiguous\n"
	+"\tDon't include ambiguous characters in the password(over version)\n"
	+"  -h or --help\n"
	+"\tPrint a help message\n"
	+"  -H or --sha1=text[:seed]\n"
	+"\tUse sha1 hash of given text as a (not so) random generator\n"
	+"  -C\n\tPrint the generated passwords in columns\n"
	+"  -1\n\tDon't print the generated passwords in columns\n"
	+"  -v or --no-vowels\n"
	+"\tDo not use any vowels so as to avoid accidental nasty words";
	+"\nfilter:\n"
	+"   --uniq\n"
	+"\tDo not include the same password\n"
	+"   --grep-upper\n"
	+"\tLimit to those containing capital letters\n"
	+"   --grep-lower\n"
	+"\tLimit to those containing lowercase letters\n"
	+"   --grep-digit\n"
	+"\tLimit to those containing numbers\n"
	+"   --grep-punct\n"
	+"\tLimit to those containing special characters\n"
	+"   --grep-1upper\n"
	+"\tLimit to one uppercase letter\n"
	+"   --uniq-char\n"
	+"\tDo not include the same charactern"
	+"   --same2char\n"
	+"\tInclude 2 or more same characters\n"
	+"   --same3char\n"
	+"\tInclude 3 or more same characters\n"
	+"   --reading\n"
	+"\tAdd password reading\n"

const usage_ja = ""
	+"Usage: pwgen [ OPTIONS ] [ pw_length ] [ num_pw ]\n\n"
	+"pwgenでサポートされるオプション:\n"
	+"  -c or --capitalize\n"
	+"\tパスワードに少なくとも1つの大文字を含める（デフォルト）\n"
	+"  -A or --no-capitalize\n"
	+"\tパスワードに大文字を含めない\n"
	+"  -n or --numerals\n"
	+"\tパスワードに少なくとも1つの数字を含める（デフォルト）\n"
	+"  -0 or --no-numerals\n"
	+"\tパスワードに数字を含めない\n"
	+"  -y or --symbols\n"
	+"\t少なくとも1つの特別な記号をパスワードに含める\n"
	+"  -s or --secure\n"
	+"\t完全にランダムなパスワードを生成する\n"
	+"  -B or --ambiguous\n"
	+"\tあいまいな文字をパスワードに含めない\n"
	+"  -BB or --ex-ambiguous\n"
	+"\tあいまいな文字をパスワードに含めない（過剰版）\n"
	+"  -h or --help\n"
	+"\tヘルプメッセージを表示する\n"
	+"  -H or --sha1=text[:seed]\n"
	+"\t与えられたテキストのsha1ハッシュを（そうではない）ランダムジェネレータとして使用する\n"
	+"  -C\n\t生成されたパスワードを列表示する（デフォルト）\n"
	+"  -1\n\t生成されたパスワードを列表示しない\n"
	+"  -v or --no-vowels\n"
	+"\t母音を使用しない\n"
	+"\nフィルター:\n"
	+"   --uniq\n"
	+"\t同じパスワードを含めない\n"
	+"   --grep-upper\n"
	+"\t大文字を含むものに限定する\n"
	+"   --grep-lower\n"
	+"\t小文字を含むものに限定する\n"
	+"   --grep-digit\n"
	+"\t数字を含むものに限定する\n"
	+"   --grep-punct\n"
	+"\t特殊文字を含むものに限定する\n"
	+"   --grep-1upper\n"
	+"\t大文字が1文字だけ含まれているものに限定する\n"
	+"   --uniq-char\n"
	+"\tパスワード中に同じ文字を含めない\n"
	+"   --same2char\n"
	+"\tパスワード中に同じ文字を2つ以上含める\n"
	+"   --same3char\n"
	+"\tパスワード中に同じ文字を3つ以上含める\n"
	+"   --reading\n"
	+"\tパスワードの読みを追加する\n"

function get_opt(url) {
	let locParams = ["--length", "--num-passwords"];
	let opt = [];
	url = url.replace(/^.*\?/,"");
	for (let s of url.split('&')) {
		let [key,value] = s.split('=');
		if (!key) continue;
		if (!/^\-/.test(key) && !value && locParams.length > 0) {
			value = key;
			key = locParams.shift();
		}
		if (key in pwgen_options) key = pwgen_options[key];
		if (/^\-([0-9a-zA-Z]+)$/.test(key)) {
			let keys = RegExp.$1.split("");
			for (let key of keys) {
				opt.push({"key": `-${key}`});
			}
			if (value) opt[opt.length - 1].value = value
		} else {
			opt.push({"key": key, "value": value});
		}
	}
	return opt;
}
class Opt {
	constructor(url) {
		this.registObj({
			"pw_length": 8,
			"num_pw": -1,
			"pwgen_flags": PW_DIGITS | PW_UPPERS,
			"pwgen_func": pw_phonemes,
			"do_columns": 1,
			"pw_number": pw_random_number,
			"pw_length": 8,
			"num_cols": -1,
			"term_width": 80,
			"do_help": false,
			"error": "",
		});
		this._keyValues = [];
		if (arguments.length == 1) this.fromUrl(url);  
	}
	longname_options() {
		return pwgen_options();
	}
	fromUrl(url) {
		this._keyValues = this.parseUrl(url);
		this.parseKeyValues(this._keyValues);
	}
	parseUrl(url) {
		return get_opt(url);
	}
	registObj(obj) {
		for (let key in obj) {
			this[key] = obj[key];
		}
	}
	merge(o) {
		if (o instanceof Opt) o = o.keyValues();
		if (!Array.isArray(o)) o = [o];
		this._keyValues = this._keyValues.concat(o);
		this.parseKeyValues(this._keyValues);
	}
	keyValues() {return this._keyValues}
	keys() {
		return this._keyValues.map(o=>o.key);
	}
	valuesForKey(key) {
		return this._keyValues.filter(o=>o.key==key).map(o=>o.value);		
	}
	valueForKey(key) {
		return this.valuesForKey(key).reverse()[0];		
	}
	hasKey(key) {
		return this._keyValues.filter(o=>o.key==key).length > 0;		
	}
	parseKeyValues(keyValues) {
		this.pw_length = 8;
		this.num_pw = -1;
		this.pwgen_flags = PW_DIGITS | PW_UPPERS;
		this.pwgen_func = pw_phonemes;
		this.do_columns = 1;
		this.pw_number = pw_random_number;
		this.pw_length = 8;
		this.do_help = false;
		this.num_cols = 1;
		this.error = "";
		//this.term_width = 80;

		for (let o of keyValues) {
			if (o.key == "-0") this.pwgen_flags &= ~PW_DIGITS;
			if (o.key == "-A") this.pwgen_flags &= ~PW_UPPERS;
			if (o.key == "-a");
			if (o.key == "-B") this.pwgen_flags |= PW_AMBIGUOUS;
			if (o.key == "-c") this.pwgen_flags |= PW_UPPERS;
			if (o.key == "-n") this.pwgen_flags |= PW_DIGITS;
			if (o.key == "-N") {
					this.num_pw = parseInt(o.value);
					if (isNaN(this.num_pw)) {
						this.error = `Invalid number of passwords: ${o.value}`;
						return;
					}
			}
			if (o.key == "-s") this.pwgen_func = pw_rand;
			if (o.key == "-C") this.do_columns = true;
			if (o.key == "-1") this.do_columns = false;
			if (o.key == "-H") this.pw_number = pw_sha1_number;
			if (o.key == "-y") this.pwgen_flags |= PW_SYMBOLS;
			if (o.key == "-v") {
					this.pwgen_func = pw_rand;
					this.pwgen_flags |= PW_NO_VOWELS | PW_DIGITS | PW_UPPERS;
			}
			if (o.key == "-h" || o.key == "-?") {
					this.do_help = true;
			}
		
			if (o.key == "-L") {
				this.pw_length = parseInt(o.value);
				if (isNaN(this.pw_length)) {
					this.error = `Invalid password length: ${o.value}`;
					return;
				}
				if (this.pw_length < 5)
					this.pwgen_func = pw_rand;
				if (this.pw_length <= 2)
					this.pwgen_flags &= ~PW_UPPERS;
				if (this.pw_length <= 1)
					this.pwgen_flags &= ~PW_DIGITS;
			}

			if (o.key == "--term-width") this.term_width = parseInt(o.value);
		}
		if (this.do_columns) {
			this.num_cols = Math.floor(this.term_width / (this.pw_length + 1));
			if (this.num_cols == 0)
				this.num_cols = 1;
		}
		if (this.num_pw < 0) {
			this.num_pw = this.do_columns ? this.num_cols * 20 : 1;
		}
	}
}
class Pwgen {
	constructor(opt) {
		this._list = [];
		this._filtered = [];
		this._opt = opt;
	}
	list() {
		return this._filtered;
	}
	generate() {
		if (arguments.length == 1) this._opt = arguments[0];
		if (this._opt.do_help) {
			this._list = [usage_ja];
			this.clearFilter();
			return;
		}
		if (this._opt.error) {
			this._list = [this._opt.error];
			this.clearFilter();
			return;
		}
		pw_ambiguous = pw_ambiguous_list[0];
		if (this._opt.valuesForKey("-B").length>=2) pw_ambiguous = pw_ambiguous_list[1];
		if (this._opt.pw_number === pw_sha1_number) pw_sha1_init(this._opt.valueForKey("-H"));
		this._list = [];
		while (this._list.length < this._opt.num_pw) {
			this._list.push(this._opt.pwgen_func(this._opt));
		}
		this.clearFilter();
	}
	clearFilter() {
		this._filtered = this._list.slice(0);
	}
	filter() {
		if (arguments.length == 1) this._opt = arguments[0];
		if (this._opt.hasKey("--uniq")) {
			let new_list = [];
			for (let pw of this._filtered) {
				if (!new_list.includes(pw)) new_list.push(pw);
			}
			this._filtered = new_list;
		}
		if (this._opt.hasKey("--grep-upper")) this._filtered = this._filtered.filter(pw=>(/[A-Z]/.test(pw)));
		if (this._opt.hasKey("--grep-lower")) this._filtered = this._filtered.filter(pw=>(/[a-z]/.test(pw)));
		if (this._opt.hasKey("--grep-digit")) this._filtered = this._filtered.filter(pw=>(/[0-9]/.test(pw)));
		if (this._opt.hasKey("--grep-punct")) {
			this._filtered = this._filtered.filter(pw=>pw.split("").filter(s=>pw_symbols.includes(s)).length>0);
		}
		if (this._opt.hasKey("--grep-1punct")) {
			this._filtered = this._filtered.filter(pw=>pw.split("").filter(s=>pw_symbols.includes(s)).length==1);
		}
		if (this._opt.hasKey("--grep-1upper")) this._filtered = this._filtered.filter(pw=>(/^[^A-Z]*[A-Z][^A-Z]*$/.test(pw)));
		if (this._opt.hasKey("--uniq-char")) {
			this._filtered = this._filtered.filter(pw=>{
				let count = {};
				for (let s of pw.split("")) {
					count[s] = count[s]+1 || 1;
				}
				return Object.values(count).reduce((a,b)=>Math.max(a,b)) == 1;
			});
		}
		if (this._opt.hasKey("--same2char")) {
			this._filtered = this._filtered.filter(pw=>{
				let count = {};
				for (let s of pw.split("")) {
					count[s] = count[s]+1 || 1;
				}
				return Object.values(count).reduce((a,b)=>Math.max(a,b)) >= 2;
			});
		}
		if (this._opt.hasKey("--same3char")) {
			this._filtered = this._filtered.filter(pw=>{
				let count = {};
				for (let s of pw.split("")) {
					count[s] = count[s]+1 || 1;
				}
				return Object.values(count).reduce((a,b)=>Math.max(a,b)) >= 3;
			});
		}
		if (this._opt.hasKey("--reading") && !this._opt.do_help) {
			this._filtered = this._filtered.map(pw=>pw + " "+ pw.split("").map(s=>{
					if (s.toLowerCase() in pw_yomi) {
						return pw_yomi[s.toLowerCase()];
					} else {
						return s;
					}
			}).join("・"));
		}
	}
	toString() {
		let lines = [];
		let num_cols = this._opt.num_cols;
		if (this._opt.hasKey("--reading")) num_cols = 1;
		lines.unshift([]);
		for (let pw of this._filtered) {
			if (lines[0].length >= num_cols) lines.unshift([]);
			lines[0].push(pw);
		}
		return lines.map(line=>line.join(" ")).reverse().join("\n");
	}
}
function main(opt) {
	if (arguments.length == 0) opt = new Opt("");
	if (typeof opt == "string") opt = new Opt(opt);
	let pw = new Pwgen(opt);	
	pw.generate();
	pw.filter();
	return pw.toString();
}
