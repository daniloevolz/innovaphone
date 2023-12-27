
ifdef RELEASESTATE
rflags = -DBUILD='$(BUILD)' -DRELEASE_STATE='"$(RELEASESTATE) "'
else
rflags = -DBUILD='$(BUILD)'
endif

temp = $(subst -,_,$(RELEASESTATE))
cflags += -DDBG_FLAG_$(subst :, -DDBG_FLAG_,$(temp))
