
WEBSRC += \
	web/ui1.table/innovaphone.ui1.table.js

$(OUTDIR)/obj/ui1.table_httpdata.cpp: $(IP_SRC)/web1/ui1.table/ui1.table.mak $(IP_SRC)/web1/ui1.table/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/ui1.table_httpdata.cpp \
		ui1.table/innovaphone.ui1.table.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/ui1.table_httpdata.o
$(OUTDIR)/obj/ui1.table_httpdata.o: $(OUTDIR)/obj/ui1.table_httpdata.cpp
