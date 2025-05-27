
WEBSRC += \
	web/ui1.treeview/innovaphone.ui1.treeview.js 

$(OUTDIR)/obj/ui1.treeview_httpdata.cpp: $(IP_SRC)/web1/ui1.treeview/ui1.treeview.mak $(IP_SRC)/web1/ui1.treeview/*.js
		$(IP_SRC)/exe/httpfiles $(HTTPFILES-WEB-FLAGS) -d $(IP_SRC)/web1 -o $(OUTDIR)/obj/ui1.treeview_httpdata.cpp \
		ui1.treeview/innovaphone.ui1.treeview.js,SERVLET_STATIC,HTTP_CACHE+HTTP_NOPWD+HTTP_FORCENOPWD 

COMMONOBJS += $(OUTDIR)/obj/ui1.treeview_httpdata.o
$(OUTDIR)/obj/ui1.treeview_httpdata.o: $(OUTDIR)/obj/ui1.treeview_httpdata.cpp