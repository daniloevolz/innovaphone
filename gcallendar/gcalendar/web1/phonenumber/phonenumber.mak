
WEBSRC += \
	web/phonenumber/innovaphone.phonenumber.js

$(OUTDIR)/obj/phonenumber_httpdata.cpp: $(IP_SRC)/web1/phonenumber/phonenumber.mak $(IP_SRC)/web1/phonenumber/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/phonenumber_httpdata.cpp \
		phonenumber/innovaphone.phonenumber.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD

COMMONOBJS += $(OUTDIR)/obj/phonenumber_httpdata.o
$(OUTDIR)/obj/phonenumber_httpdata.o: $(OUTDIR)/obj/phonenumber_httpdata.cpp
