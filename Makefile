JS = pwgen_h.js pw_rand_c.js pw_phonemes_c.js sha1_c.js randnum_c.js sha1num_c.js pwgen_c.js

all: index_concat.html

clean:
	rm -f index_concat.html

copy:
	cat  index_concat.html | xsel -ib

index_concat.html: $(JS) index.html
	rm -f index_concat.html
	sed '1,/<\/body>/p;d' index.html  > index_concat.html
	/bin/echo -e "<script>\n'use strict'" >> index_concat.html
	for target in $(JS); do\
		printf "\n//%72s\n" | tr ' ' '-' >> index_concat.html;\
		sed "/'use strict'/d" $$target >>  index_concat.html;\
    done
	/bin/echo -e "</script>\n" >> index_concat.html
	sed '/<script>/,$$p;d' index.html  >> index_concat.html

pwgen.js: $(JS)
	echo "'use strict'" > pwgen.js
	for target in $(JS); do\
		printf "\n//%72s\n" | tr ' ' '-' >> pwgen.js;\
		sed "/'use strict'/d" $$target >> pwgen.js;\
    done
	cat pwgen_node.js >> pwgen.js
