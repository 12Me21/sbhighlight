var input = document.getElementById("input");
var code = document.getElementById("code");

var input_copy = document.getElementById("input_copy");
input_copy.addEventListener("click", function() {
	code.textContent = input.value;
});
input_copy.click();

var input_highlight = document.getElementById("input_highlight");
input_highlight.addEventListener("click", function() {
	applySyntaxHighlighting(code);
});
input_highlight.click();

var input_wrap = document.getElementById("input_wrap");
input_wrap.addEventListener("change", function() {
	if (input_wrap.checked) {
		code.style.width = "46ch";
		code.style.whiteSpace = "pre-wrap";
	} else {
		code.style.removeProperty("width");
		code.style.whiteSpace = "pre";
	}
});
input_wrap.checked = !false;
input_wrap.click();

var input_font = document.getElementById("input_font");
input_font.addEventListener("change", function() {
	if (input_font.checked) {
		code.style.fontFamily = "SmileBASIC";
		code.style.fontSize = "16px";
		code.style.lineHeight = "16px";
	} else {
		code.style.fontFamily = "monospace";
		code.style.fontSize = "0.8rem";
		code.style.lineHeight = "0.9rem";
	}
});
input_font.checked = !false;
input_font.click();

