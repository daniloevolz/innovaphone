WEBSRC += \
	web/presence/innovaphone.presence.js

$(OUTDIR)/obj/presence_httpdata.cpp: $(IP_SRC)/web1/presence/presence.mak $(IP_SRC)/web1/presence/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/presence_httpdata.cpp \
		presence/innovaphone.presence.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/presence_httpdata.o
$(OUTDIR)/obj/presence_httpdata.o: $(OUTDIR)/obj/presence_httpdata.cpp
