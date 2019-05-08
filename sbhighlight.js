var keywords=["BREAK","COMMON","CONTINUE","ELSE","END","ENDIF","REM","REPEAT","STOP","THEN","WEND"];
var argKeywords=["CALL","DATA","DEC","DIM","ELSEIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","RESTORE","RETURN","SWAP","UNTIL","USE","VAR","WHILE"];
var builtinFunctions=["ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BACKTRACE","BEEP","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMPRG","BGMPRGA","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKMML","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","DEG","DELETE","DIALOG","DISPLAY","DLCOPEN","DTREAD","EFCOFF","EFCON","EFCSET","EFCWET","EXP","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FONTDEF","FORMAT$","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GOFS","GPAGE","GPAINT","GPRIO","GPSET","GPUTCHR","GSAVE","GSPOIT","GTRI","GYROA","GYROSYNC","GYROV","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAX","MICDATA","MICSAVE","MICSTART","MICSTOP","MID$","MIN","MPEND","MPGET","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","OPTION","PCMCONT","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RGB","RGBREAD","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLIP","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STICKEX","STR$","SUBST$","TALK","TALKCHK","TALKSTOP","TAN","TANH","TIME$","TMREAD","TOUCH","UNSHIFT","VAL","VISIBLE","VSYNC","WAIT","WAVSET","WAVSETA","WIDTH","XOFF","XON","XSCREEN"];
var systemVariables=["CALLIDX","CSRX","CSRY","CSRZ","DATE$","ERRLINE","ERRNUM","ERRPRG","EXTFEATURE","FREEMEM","HARDWARE","MAINCNT","MICPOS","MICSIZE","MILLISEC","MPCOUNT","MPHOST","MPLOCAL","PCMPOS","PRGSLOT","RESULT","SYSBEEP","TABSTEP","VERSION"];

//token types:
//comment, def, arg-keyword, function, operator, name, lparen, lbracket, equals, semicolon, comma, keyword, variable, real-label, string, number, linebreak, eof, colon, rparen, rbracket

function highlight(code,callback){
	var i=-1,c,isAlpha,isDigit;
	function next(){
		i++;
		c=code.charAt(i);
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z');
		isDigit=(c>='0'&&c<='9');
	}
	
	function jump(pos){
		i=pos-1;
		next();
	}
	
	var prev=0;
	var prevType="linebreak";
	var unknownWord,unknownBefore,whitespaceAfter="";
	
	function isInExpr(type){
		return type=="argkeyword"||type=="function"||type=="operator"||type=="name"||type=="exprc"||type=="lbracket"||type=="equals";
	}
	
	function push(type,cssType){
		var word=code.substring(prev,i);
		prev=i;
		
		if(unknownWord){
			if(type=="whitespace"){
				whitespaceAfter+=word;
				return;
			}
			
			if(type=="lbracket"||type=="equals"){
				prevType="variable";
			}else if(type=="lparen"){
				prevType="function";
			}else{
				prevType=isInExpr(unknownBefore) ? "variable" : "function"
			}
			
			var upper=unknownWord.toUpperCase();
			var cssType2;
			
			if(prevType=="function"){
				if(upper=="TO"||upper=="STEP"){
					prevType="argkeyword";
					cssType2="to-step keyword";
				}else{
					prevType="function";
					cssType2=builtinFunctions.indexOf(upper)!=-1 ? "function statement" : "statement";
				}
			}else{ //if variable
				prevType="variable";
				cssType2=systemVariables.indexOf(upper)!=-1 ? "function variable" : "variable";
			}
			callback(unknownWord, cssType2);
			
			unknownWord=undefined;
			if(whitespaceAfter){
				callback(whitespaceAfter);
				whitespaceAfter = "";
			}
		}
		
		if(type=="word"){
			var upper=word.toUpperCase();
			
			if(upper=="TRUE"||upper=="FALSE"){
				type="number";
				cssType="true-false number";
			}else if(upper=="DIV"||upper=="MOD"||upper=="AND"||upper=="OR"||upper=="XOR"||upper=="NOT"){
				type="operator";
				cssType="word-operator operator";
			}else if(upper=="DEF"){
				type="def";
				cssType="def keyword";
			}else if(keywords.indexOf(upper)>=0){
				type="keyword";
				cssType="keyword";
			}else if(argKeywords.indexOf(upper)>=0){
				type="argkeyword";
				cssType="keyword";
			}else{
				if(prevType=="def"){
					type="name";
					cssType="name";
				}else{
					unknownWord=word;
					unknownBefore=prevType;
					prevType=undefined;
					return;
				}
			}
		}else if(type=="label"){
			if(isInExpr(prevType)){
				type="string";
				cssType="label-string string";
			}
		}else{
			if(cssType!=false){
				cssType=type;
			}else{
				cssType=undefined;
			}
		}
		callback(word,cssType);
		if(type!="whitespace")
			prevType=type;
	}
	
	next();
		
	var start,start2;
	//loop until the end of the string
	while(c){
		//
		//keywords, functions, variables
		//
		if(isAlpha||c=='_'){
			next();
			//read name
			while(isAlpha||isDigit||c=='_')
				next();
			//read type suffix
			if(c=='#'||c=='%'||c=='$')
				next();
			//push word type
			push("word");
		//
		//numbers
		//
		}else if(isDigit||c=='.'){
			//if digit was found, read all of them
			while(isDigit)
				next();
			//if there's a decimal point
			if(c=='.'){
				next();
				//read digits after
				if(isDigit){
					next();
					while(isDigit)
						next();
				}else{
					//if GOTO is available: GOTO @skip_e
					if(c=='#')
						next();
					push("number");
					continue;
				}
			}
			//E notation
			if(c=='E'||c=='e'){
				var ePos=i;
				next();
				//check for + or -
				if(c=='+'||c=='-')
					next();
				//read digits
				if(isDigit){
					next();
					while(isDigit)
						next();
				//no digits (invalid)
				}else{
					jump(ePos);
					push();
					continue;
				}
			}
			//(if GOTO is available: @skip_e)
			//read float suffix
			if(c=='#')
				next();
			push("number");
		//
		//strings
		//
		}else switch(c){
		case '"':
			next();
			//read characters until another quote, line ending, or end of input
			while(c && c!='"' && c!='\n' && c!='\r')
				next();
			//read closing quote
			if(c=='"')
				next();
			push("string");
		//
		//comments
		//
		break;case '\'':
			next();
			//read characters until line ending or end of input
			while(c && c!='\n' && c!='\r')
				next();
			push("comment");
		//
		//logical AND, hexadecimal, binary
		//
		break;case '&':
			next();
			switch(c){
			//logical and
			case '&':
				next();
				push("operator");
			//hexadecimal
			break;case 'H':case 'h':
				var hPos=i;
				next();
				//read hexadecimal digits
				if(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f'){
					next();
					while(isDigit||c>='A'&&c<='F'||c>='a'&&c<='f')
						next();
					push("number");
				}else{
					jump(hPos);
					push();
				}
			//binary
			break;case 'B':case 'b':
				var bPos=i;
				next();
				//read hexadecimal digits
				if(c=='0'||c=='1'){
					next();
					while(c=='0'||c=='1')
						next();
					push("number");
				}else{
					jump(bPos);
					push();
				}
			//invalid &
			break;default:
				push();
			}
		//
		//labels
		//
		break;case '@':
			next();
			//read name
			while(isDigit||isAlpha||c=='_')
				next();
			//ok
			push("label");
		//
		//constants
		//
		break;case '#':
			next();
			//read name
			if(isDigit||isAlpha||c=='_'){
				next();
				while(isDigit||isAlpha||c=='_')
					next();
				push("number");
			}else{
				push();
			}
		//
		//logical or
		//
		break;case '|':
			next();
			//logical or
			if(c=='|'){
				next();
				push("operator");
			//invalid
			}else{
				push();
			}
		//
		//less than, less than or equal, left shift
		//
		break;case '<':
			next();
			//<= <<
			if(c=='='||c=='<')
				next();
			push("operator");
		//
		//greater than, greater than or equal, right shift
		//
		break;case '>':
			next();
			//>= >>
			if(c=='='||c=='>')
				next();
			push("operator");
		//
		//equal, equal more
		//
		break;case '=':
			next();
			//==
			if(c=='='){
				next();
				push("operator");
			}else{
				push("equals");
			}
		//
		//logical not, not equal
		//
		break;case '!':
			next();
			// !=
			if(c=='=')
				next();
			push("operator");
		//
		//add, subtract, multiply, divide
		//
		break;case '+':case '-':case '*':case '/':
			next();
			push("operator");
		//
		//
		// Left Bracket
		break;case '[':
			next();
			push("lbracket",false);
		// Inside Expression
		break;case '(':case ';':case ',':
			next();
			push("exprc",false);
		// Linebreak
		break;case '\n':
			next();
			push("linebreak",false);
		// Whitespace
		break;case ' ':case '\t':
			next();
			push("whitespace",false);
		// ? print
		break;case '?':
			next();
			push("argkeyword","question keyword");
		// Other
		break;default:
			next();
			push(undefined,false);
		}
	}
	push("eof");
}

//escape < and &
function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");
}

function applySyntaxHighlighting(element){
	var html="",prevType=false;
	//this is called for each highlightable token
	function callback(word,type){
		console.log("CB",word,type);
		//only make a new span if the CSS class has changed
		if(type!=prevType){
			//close previous span
			if(prevType){
				html+="</span>";
			}
			//open new span
			if(type){
				html+="<span class=\""+type+"\">";
			}
		}
		html+=escapeHTML(word);
		prevType=type;
	}
	
	highlight(element.textContent,callback);
	//close last span
	if(prevType){
		html+="</span>";
	}
	element.innerHTML=html;
}
