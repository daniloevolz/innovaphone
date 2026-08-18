
WEBSRC += \
	web/standalone/standalone.js

$(OUTDIR)/obj/standalone_httpdata.cpp: $(IP_SRC)/web1/standalone/standalone.mak $(IP_SRC)/web1/standalone/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/standalone_httpdata.cpp \
		standalone/standalone.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD \
		standalone/standalonecolors.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD \
		standalone/standalonetexts.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/standalone_httpdata.o
$(OUTDIR)/obj/standalone_httpdata.o: $(OUTDIR)/obj/standalone_httpdata.cpp
