
function main(opt) {
	if (arguments.length == 0) opt = new Opt("");
	if (typeof opt == "string") opt = new Opt(opt);
	let pw = new Pwgen(opt);	
	pw.generate();
	pw.filter();
	return pw.toString();
}

let url = [];
let i=2;
while (i<process.argv.length) {
	if (["-N","-L","--term-width"].includes(process.argv[i])) {
		url.push(process.argv[i] + "=" + process.argv[i+1]);
		i+=2;
	} else {
		url.push(process.argv[i]);
		i++;
	}
}
let opt = new Opt(url.join("&"));
let pwgen = new Pwgen(opt);
pwgen.generate();
pwgen.filter();
console.log(pwgen.toString());
/*
-BB --uniq --grep-upper --grep-lower --grep-digit -1 -l 8 -N 100000
*/