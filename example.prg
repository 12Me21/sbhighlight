'=============
'=== START ===
'=============
OPTION STRICT:OPTION DEFINT
CLS:XSCREEN 0:COLOR 15,0??
GPAGE 0,0:GCLS:BACKCOLOR 0

VAR SLOT=0
VAR TAB=1 'TABSTEP

VAR SLOT$ 'DIALOG return value
VAR i,k,ii,l 'Used in [FOR] loops
VAR LIN$,MOR,LES 'INDENT lin$ OUT mor, les
VAR KEYWORD$ 'Current keyword to look for
VAR _DEF 'Inside a DEF

VAR LINES 'PRGSIZE
VAR LINE$ 'Contents of current line
VAR MORE,LESS 'Indent increase/decrease
VAR IND 'Current indent level
VAR Y=1 'Cursor row

VAR Q$=CHR$(34) ' "

'= keywords to look for =
DIM KEYWORDS$[14],KEYWORDS[14]
@KEYWORDS
DATA "IF","THEN","ELSEIF","ELSE","ENDIF"
DATA "WHILE","WEND","REPEAT","UNTIL"
DATA "FOR","NEXT","DEF","END","REM"
COPY KEYWORDS$,@KEYWORDS

'=================
'=== FUNCTIONS ===
'=================

'== Indent Change ==
DEF INDENT LIN$ OUT MOR,LES
 MOR=0:LES=0
 IF LEN(LIN$)==0 THEN RETURN
 LIN$=LIN$+" "
 UCASE$ LIN$
 VAR _IF=#FALSE 'Inside a [single-line] IF
 VAR _EIF=#FALSE 'Inside a ELSEIF-THEN line
 VAR NQ 'Inside a string, Next "
 
 FOR i=0 TO LEN(LIN$)-2
  '= skip strings =
  IF LIN$[I]==Q$ THEN
   NQ=INSTR(I+1,LIN$,Q$)
   IF NQ==-1 THEN RETURN
   I=NQ+1
  ENDIF
  IF LIN$[I]=="'" THEN RETURN
  '= look for every keyword =
  FOR k=0 TO 13
   KEYWORD$=KEYWORDS$[k]
   VAR LK=LEN(KEYWORD$)
   IF MID$(LIN$,I,LK)==KEYWORD$ THEN
    '= check surrounding characters
    IF INSTR("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#_%",(LIN$)[i+LK])==-1&&INSTR("ABCDEFGHIJKLMNOPQRSTUVWXYZ@_",(" "+LIN$)[i])==-1 THEN
     
     IF.THEN
     ELSEIF k==0 THEN _IF=#TRUE 'IF
     ELSEIF K==1 THEN 'THEN
      IF _IF THEN
       FOR l=I+LK TO LEN(LIN$)-2
        IF LIN$[l]=="'" THEN
         INC MOR
         INC KEYWORDS[1]
         RETURN
        ELSEIF LIN$[l]!=" " THEN BREAK
        ENDIF
       NEXT
       IF l==LEN(LIN$)-1 THEN INC MOR:INC KEYWORDS[1]
      ENDIF
     ELSEIF K==2&&!_IF THEN _EIF=#TRUE:INC MOR:INC LES'ELSEIF
     ELSEIF K==3&&!_IF THEN INC MOR:INC LES 'ELSE
     ELSEIF K==4&&!_IF THEN INC LES:INC KEYWORDS[4]'ENDIF
     ELSEIF K==5 THEN INC MOR 'WHILE
     ELSEIF K==6 THEN INC LES 'WEND
     ELSEIF K==7 THEN INC MOR 'REPEAT
     ELSEIF K==8 THEN INC LES 'UNTIL
     ELSEIF K==9 THEN INC MOR 'FOR
     ELSEIF K==10 THEN INC LES 'NEXT
     ELSEIF K==11 THEN _DEF=#TRUE:INC MOR 'DEF
     ELSEIF K==12&&_DEF THEN
      INC LES:_DEF=#FALSE:INC KEYWORDS[12] 'END
     ELSEIF K==13 THEN RETURN
     ENDIF
     INC I,LK
     IF K>=5&&K<=11 THEN INC KEYWORDS[K]
    ENDIF
   ENDIF
  NEXT
 NEXT
END

'== Remove left spaces and CR ==
DEF TRIM$(STRING$)
 VAR TEMP$=POP(STRING$)
 FOR l=0 TO LEN(STRING$)-1
  IF STRING$[l]!=" " THEN BREAK
 NEXT
 RETURN RIGHT$(STRING$,LEN(STRING$)-l)
END

'== Convert to uppercase ==
DEF UCASE$ STRING$
 VAR AS
 FOR l=0 TO LEN(STRING$)-1
  AS=ASC(STRING$[l])
  IF AS>=97&&AS<=122 THEN STRING$[l]=CHR$(AS-32)
 NEXT
END

'== Text % bar ==
DEF BAR$(PROGRESS#)
 IF !(PROGRESS# MOD 8) THEN RETURN ""*(PROGRESS#/8)
 RETURN ""*(PROGRESS#/8)+""[PROGRESS# MOD 8]
END

'== Move cursor to correct line ==
DEF RELOCATE
 Y=MIN(Y+1,29)
 LOCATE 0,Y
END

'== Error Message ==
DEF ERROR TXT$,FATAL,SHOWLINE
 VAR F$="%S"
 IF FATAL THEN UNSHIFT F$,"[Error] "
 IF SHOWLINE THEN PUSH F$," in %D:%D"
 RELOCATE:?FORMAT$(F$,TXT$,SLOT,ii)
 BEEP 4
END

'== List missing/extra keywords
DEF DEBUG ENDOF
 VAR BAD=KEYWORDS[1]-KEYWORDS[4]
 IF BAD<0 THEN
  RELOCATE:?"…Too many ENDIF ×";-BAD
 ELSEIF ENDOF&&BAD>0 THEN
  RELOCATE:?"…Not enough ENDIF ×";BAD
 ENDIF
 FOR K=5 TO 12 STEP 2
  BAD=KEYWORDS[K]-KEYWORDS[K+1]
  IF BAD<0 THEN
   RELOCATE:?"-Too many "+KEYWORDS$[K+1];" ×";-BAD
  ELSEIF ENDOF&&BAD>0 THEN
   RELOCATE:?"-Not enough "+KEYWORDS$[K+1];" ×";BAD
  ENDIF
 NEXT
 RELOCATE:?
END

'=================
'=== MAIN LOOP ===
'=================

'== User input ==
REPEAT
 SLOT$=DIALOG(STR$(SLOT),"Indent program in SLOT:",1)
 IF RESULT!=#TRUE THEN STOP
UNTIL INSTR("0123",SLOT$)!=-1
SLOT=VAL(SLOT$)

'= trigger dialog =
PRGEDIT SLOT,-1:PRGINS "",#TRUE
IF RESULT!=#TRUE THEN END
PRGDEL 'remove the line we added

VAR C#=MILLISEC

LINES=PRGSIZE(SLOT)
IF LINES==0 THEN LINES=1 'PRGSIZE bug
FOR ii=1 TO LINES
 PRGEDIT SLOT,ii
 LINE$=TRIM$(PRGGET$())
 '= progress bar =
 LOCATE 0,0?BAR$(ii*400 DIV LINES);
 
 INDENT LINE$ OUT MORE,LESS
 DEC IND,LESS
 
 ' this is because of code like WHILE 1:WEND 
 IF IND>=0 THEN
  PRGSET " "*IND*TAB+LINE$
  INC IND,MORE
 
 ELSE
  INC IND,MORE
  
  IF IND<0 THEN
   ERROR "Indent out of range",#TRUE,#TRUE
   DEBUG #FALSE
   END
  ENDIF
  
  PRGSET " "*IND*TAB+LINE$
 ENDIF
 
 IF LINE$=="'INDENT END" THEN BREAK
NEXT
PRGDEL 'remove line added by last PRGSET

IF IND!=0 THEN ERROR "Indent not 0 at end of program",#TRUE,#FALSE
DEBUG #TRUE

'= Show speed stats =
C#=(MILLISEC-C#+1)/1000
?FORMAT$("%.3F sec   %.1F ln/sec   %.1F chr/sec ",C#,LINES/C#,PRGSIZE(SLOT,1)/C#)
?

'Inside IF, use CONTINUE instead of NEXT/WEND/REPEAT
REM  IF X=1 THEN NEXT
REM  IF X=1 THEN WEND
REM  IF X=1 THEN REPEAT
REM  IF X=1 THEN CONTINUE
