'use strict'
/*
 * This program is the JavaScript port of SHA1 demonstration code in rfc3174. by hachisukansw
 *
*/

//------------------------------------------------------------------------
/*
 *  sha1.h
 *
 *  Description:
 *      This is the header file for code which implements the Secure
 *      Hashing Algorithm 1 as defined in FIPS PUB 180-1 published
 *      April 17, 1995.
 *
 *      Many of the variable names in this code, especially the
 *      single character names, were used because those were the names
 *      used in the publication.
 *
 *      Please read the file sha1.c for more information.
 *
 */
const   shaSuccess = 0,
        shaNull = 1,            /* Null pointer parameter */
        shaInputTooLong = 2 ,    /* input data too long */
        shaStateError = 3      /* called Input after Result */
const   SHA1HashSize = 20;

//------------------------------------------------------------------------
/*
 *  sha1.c
 *
 *  Description:
 *      This file implements the Secure Hashing Algorithm 1 as
 *      defined in FIPS PUB 180-1 published April 17, 1995.
 *
 *      The SHA-1, produces a 160-bit message digest for a given
 *      data stream.  It should take about 2**n steps to find a
 *      message with the same digest as a given message and
 *      2**(n/2) to find any two messages with the same digest,
 *      when n is the digest size in bits.  Therefore, this
 *      algorithm can serve as a means of providing a
 *      "fingerprint" for a message.
 *
 *  Portability Issues:
 *      SHA-1 is defined in terms of 32-bit "words".  This code
 *      uses <stdint.h> (included via "sha1.h" to define 32 and 8
 *      bit unsigned integer types.  If your C compiler does not
 *      support 32 bit unsigned integers, this code is not
 *      appropriate.
 *
 *  Caveats:
 *      SHA-1 is designed to work with messages less than 2^64 bits
 *      long.  Although SHA-1 allows a message digest to be generated
 *      for messages of any number of bits less than 2^64, this
 *      implementation only works with messages with a length that is
 *      a multiple of the size of an 8-bit character.
 *
 */
function SHA1CircularShift(bits,word) {
	return ((word) << (bits)) | ((word) >>> (32-(bits)))
}
function SHA1Reset(context)
{
    context.Length_Low             = 0;
    context.Length_High            = 0;
    context.Message_Block_Index    = 0;
    context.Intermediate_Hash = new Uint32Array(Math.ceil(SHA1HashSize/4));
    context.Intermediate_Hash[0]   = 0x67452301;
    context.Intermediate_Hash[1]   = 0xEFCDAB89;
    context.Intermediate_Hash[2]   = 0x98BADCFE;
    context.Intermediate_Hash[3]   = 0x10325476;
    context.Intermediate_Hash[4]   = 0xC3D2E1F0;
    context.Computed   = 0;
    context.Corrupted  = 0;
	context.Message_Block = new Uint8Array(64);
	return shaSuccess;
}
function SHA1Result(context, Message_Digest)
{
	if (!context || !Message_Digest)
	{
		return shaNull;
	}
	if (context.Corrupted)
	{
		return context.Corrupted;
	}
	if (!context.Computed)
	{
		SHA1PadMessage(context);
		for(let i=0; i<64; ++i)
		{
			/* message may be sensitive, clear it out */
			context.Message_Block[i] = 0;
		}
		context.Length_Low = 0;    /* and clear length */
		context.Length_High = 0;
		context.Computed = 1;
	}
	for(let i = 0; i < SHA1HashSize; ++i)
	{
		Message_Digest[i] = context.Intermediate_Hash[i>>>2]
							>>> 8 * ( 3 - ( i & 0x03 ) );
	}
	return shaSuccess;
}
function SHA1Input(context, message_array, length=-1)
{
    if (typeof message_array === "string") message_array = message_array.toUint8Array();
    if (length == -1) length = message_array.length;
	if (!length)
	{
		return shaSuccess;
	}
	if (!context || !message_array)
	{
		return shaNull;
	}
	if (context.Computed)
	{
		context.Corrupted = shaStateError;
		return shaStateError;
	}
	if (context.Corrupted)
	{
		return context.Corrupted;
	}
	let message_array_index = 0
	while(length-- && !context.Corrupted)
	{
		context.Message_Block[context.Message_Block_Index++] = 
			message_array[message_array_index] & 0xFF;
		context.Length_Low += 8;
		if (context.Length_Low == 0)
		{
			context.Length_High++;
			if (context.Length_High == 0)
			{
				/* Message is too long */
				context.Corrupted = 1;
			}
		}
		if (context.Message_Block_Index == 64)
		{
			SHA1ProcessMessageBlock(context);
		}
		message_array_index++;
	}
	return shaSuccess;
}
function SHA1ProcessMessageBlock(context)
{
    const K = [       /* Constants defined in SHA-1   */
                            0x5A827999,
                            0x6ED9EBA1,
                            0x8F1BBCDC,
                            0xCA62C1D6
	];
    let      temp;              /* Temporary word value        */
    let      A, B, C, D, E;     /* Word buffers                */
	let      W = new Uint32Array(80);             /* Word sequence               */
	/*
     *  Initialize the first 16 words in the array W
     */
    for(let t = 0; t < 16; t++)
    {
        W[t] = context.Message_Block[t * 4] << 24;
        W[t] |= context.Message_Block[t * 4 + 1] << 16;
        W[t] |= context.Message_Block[t * 4 + 2] << 8;
        W[t] |= context.Message_Block[t * 4 + 3];
	}
    for(let t = 16; t < 80; t++)
    {
       W[t] = SHA1CircularShift(1,W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16]);
    }
    A = context.Intermediate_Hash[0];
    B = context.Intermediate_Hash[1];
    C = context.Intermediate_Hash[2];
    D = context.Intermediate_Hash[3];
    E = context.Intermediate_Hash[4];

    for(let t = 0; t < 20; t++)
    {
        temp =  SHA1CircularShift(5,A) +
                ((B & C) | ((~B) & D)) + E + W[t] + K[0];
        E = D;
        D = C;
        C = SHA1CircularShift(30,B);
        B = A;
        A = temp;
    }
    for(let t = 20; t < 40; t++)
    {
        temp = SHA1CircularShift(5,A) + (B ^ C ^ D) + E + W[t] + K[1];
        E = D;
        D = C;
        C = SHA1CircularShift(30,B);
        B = A;
        A = temp;
    }
    for(let t = 40; t < 60; t++)
    {
        temp = SHA1CircularShift(5,A) +
               ((B & C) | (B & D) | (C & D)) + E + W[t] + K[2];
        E = D;
        D = C;
        C = SHA1CircularShift(30,B);
        B = A;
        A = temp;
    }
    for(let t = 60; t < 80; t++)
    {
        temp = SHA1CircularShift(5,A) + (B ^ C ^ D) + E + W[t] + K[3];
        E = D;
        D = C;
        C = SHA1CircularShift(30,B);
        B = A;
        A = temp;
    }
    context.Intermediate_Hash[0] += A;
    context.Intermediate_Hash[1] += B;
    context.Intermediate_Hash[2] += C;
    context.Intermediate_Hash[3] += D;
    context.Intermediate_Hash[4] += E;
    context.Message_Block_Index = 0;
}
function SHA1PadMessage(context)
{
    /*
     *  Check to see if the current message block is too small to hold
     *  the initial padding bits and length.  If so, we will pad the
     *  block, process it, and then continue padding into a second
     *  block.
     */
    if (context.Message_Block_Index > 55)
    {
        context.Message_Block[context.Message_Block_Index++] = 0x80;
        while(context.Message_Block_Index < 64)
        {
            context.Message_Block[context.Message_Block_Index++] = 0;
        }
        SHA1ProcessMessageBlock(context);
        while(context.Message_Block_Index < 56)
        {
            context.Message_Block[context.Message_Block_Index++] = 0;
        }
    }
    else
    {
        context.Message_Block[context.Message_Block_Index++] = 0x80;
        while(context.Message_Block_Index < 56)
        {
            context.Message_Block[context.Message_Block_Index++] = 0;
        }
    }
    /*
     *  Store the message length as the last 8 octets
     */
    context.Message_Block[56] = context.Length_High >>> 24;
    context.Message_Block[57] = context.Length_High >>> 16;
    context.Message_Block[58] = context.Length_High >>> 8;
    context.Message_Block[59] = context.Length_High;
    context.Message_Block[60] = context.Length_Low >>> 24;
    context.Message_Block[61] = context.Length_Low >>> 16;
    context.Message_Block[62] = context.Length_Low >>> 8;
    context.Message_Block[63] = context.Length_Low;
    SHA1ProcessMessageBlock(context);
}

//------------------------------------------------------------------------
/*
 *  sha1test.c
 *
 *  Description:
 *      This file will exercise the SHA-1 code performing the three
 *      tests documented in FIPS PUB 180-1 plus one which calls
 *      SHA1Input with an exact multiple of 512 bits, plus a few
 *      error test checks.
 *
 *  Portability Issues:
 *      None.
 *
 */
function SHA1Test() {
    let sha = {};
    let str = " ";
    let Message_Digest = new Uint8Array(20);

    str="abc";
    SHA1Reset(sha);
    SHA1Input(sha, str.toUint8Array(),3);
    SHA1Result(sha, Message_Digest);
    console.log(Message_Digest.hexdump() == "a9993e364706816aba3e25717850c26c9cd0d89d");

    str="abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq";
    SHA1Reset(sha);
    SHA1Input(sha, str.toUint8Array());
    SHA1Result(sha, Message_Digest);
    console.log(Message_Digest.hexdump() == "84983e441c3bd26ebaae4aa1f95129e5e54670f1");

    str=new Array(1000000).fill(0).map(()=>"a").join("");
    SHA1Reset(sha);
    SHA1Input(sha, str.toUint8Array());
    SHA1Result(sha, Message_Digest);
    console.log(Message_Digest.hexdump() == "34aa973cd4c4daa4f61eeb2bdbad27316534016f");

    str=new Array(10*8).fill(0).map(()=>"01234567").join("");
    SHA1Reset(sha);
    SHA1Input(sha, str.toUint8Array());
    SHA1Result(sha, Message_Digest);
    console.log(Message_Digest.hexdump() == "dea356a2cddd90c7a7ecedc5ebb563934f460452");

    str="あいう";
    SHA1Reset(sha);
    SHA1Input(sha, "あいう".toUint8Array());
    SHA1Result(sha, Message_Digest);
    console.log(Message_Digest.hexdump() == "eb636ba7c320e00b3749ad404b7adc7609560dee");
}

//------------------------------------------------------------------------
String.prototype.toUint8Array = function() {
    let encStr = encodeURI(this);
    let i = 0;
    let result = [];
    while (i < encStr.length) {
        if (encStr[i] == '%') {
            result.push(parseInt(encStr[i+1] + encStr[i+2],16));
            i+=3;
        } else {
            result.push(encStr[i].charCodeAt(0));
            i++;
        }
    }
    return new Uint8Array(result);
}
Uint8Array.prototype.hexdump = function() {
    let hex = Array.from(this).map(n=>(`0${n.toString(16)}`.slice(-2)));
	return hex.join("");
}
function sha1_starts( ctx ) {SHA1Reset(ctx)}
function sha1_update( ctx, input, length ) {SHA1Input(ctx, input, length)}
function sha1_finish( ctx, digest ) {SHA1Result(ctx, digest)}
