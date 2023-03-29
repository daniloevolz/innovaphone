
WEBSRC += \
	web/ui1.refpage/innovaphone.ui1.refpage.js

$(OUTDIR)/obj/ui1.refpage_httpdata.cpp: $(IP_SRC)/web1/ui1.refpage/ui1.refpage.mak $(IP_SRC)/web1/ui1.refpage/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/ui1.refpage_httpdata.cpp \
		ui1.refpage/innovaphone.ui1.refpage.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/ui1.refpage_httpdata.o
$(OUTDIR)/obj/ui1.refpage_httpdata.o: $(OUTDIR)/obj/ui1.refpage_httpdata.cpp
