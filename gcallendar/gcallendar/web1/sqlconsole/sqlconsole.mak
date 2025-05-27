
WEBSRC += \
	web/sqlconsole/innovaphone.sqlconsole.js

$(OUTDIR)/obj/sqlconsole_httpdata.cpp: $(IP_SRC)/web1/sqlconsole/sqlconsole.mak $(IP_SRC)/web1/sqlconsole/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/sqlconsole_httpdata.cpp \
		sqlconsole/innovaphone.sqlconsole.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/sqlconsole_httpdata.o
$(OUTDIR)/obj/sqlconsole_httpdata.o: $(OUTDIR)/obj/sqlconsole_httpdata.cpp
