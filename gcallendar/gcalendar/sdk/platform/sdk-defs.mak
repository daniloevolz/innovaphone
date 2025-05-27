SHELL = cmd

IP_SRC   = .
SDK_SRC  = sdk
HTTPFILES-FLAGS = -k -s 0,HTTP_GZIP
HTTPFILES-WEB-FLAGS = -k -r web -s 0,HTTP_GZIP

SYSROOT  =
INCLUDES = -I sdk -I sdk/platform -I .
# we need -fno-delete-null-pointer-checks as the btree implementations uses if(!this) ... GCC 6 removes this, as the new standard assumes that this is always NOT NULL
CFLAGS	 = -Wall -Werror -fno-delete-null-pointer-checks -c -D NO_LEGACY -D BUILD=$(BUILD) 
LIBS     = -lpthread -luuid -lhpdf -lpng -lcap -lpam -lcrypto -lssl -lmysqlclient -ldl -lz -lpq
OUTDIR   = .
BUILDDIR = .
OBJ_EXT  = o

ifneq ($(RELEASE_STATE),)
    CFLAGS += -D RELEASE_STATE="\"$(RELEASE_STATE)\""
endif

ifeq ($(DEBUG), 1)
    CFLAGS += -g3 -O0 -DDEBUG
#    CFLAGS += -fsanitize=address -fsanitize=leak
#    LFLAGS += -fsanitize=address -fsanitize=leak -static-libasan
else
    CFLAGS += -g -O3
endif

TOOLSDIR := $(INNOVAPHONE-SDK)
ifeq ($(TOOLSDIR),)
# Let's try the old variable we used (T = TOOLS)
TOOLSDIR := $(T)
endif

### x86_64 #############
ifeq ($(MAKECMDGOALS),x86_64)
SYSROOT := $(TOOLSDIR)/app-platform-libs/8/x86_64
X86_SIMD = 64

ifeq ($(DEBUG),1)
    OUTDIR = x86_64-debug
else
    OUTDIR = x86_64
endif
CC       = x86_64-linux-gnu-g++.exe
AR       = x86_64-linux-gnu-ar.exe
OBJCPY   = x86_64-linux-gnu-objcopy.exe
CFLAGS  += -isystem "$(TOOLSDIR)/x86_64-7.2.0-linux-gnu/x86_64-linux-gnu/include/c++/7.2.0" -isystem "$(SYSROOT)/usr/include" -fsigned-char 
LFLAGS  += --sysroot="$(SYSROOT)"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/usr/lib"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/lib"
LFLAGS  += -Wl,--warn-common
#LFLAGS  += -v 
#LFLAGS  += -Wl,-verbose 
#LFLAGS  += -Wl,--print-map,--cref
endif

ifeq ($(MAKECMDGOALS),clean-x86_64)
ifeq ($(DEBUG),1)
    OUTDIR = x86_64-debug
else
    OUTDIR = x86_64
endif
endif
####################

### arm #############
ifeq ($(MAKECMDGOALS),arm)
SYSROOT := $(TOOLSDIR)/app-platform-libs/8/armel
ifeq ($(DEBUG),1)
    OUTDIR = arm-debug
else
    OUTDIR = arm
endif
CC       = arm-linux-gnueabi-g++.exe
AR       = arm-linux-gnueabi-ar.exe
OBJCPY   = arm-linux-gnueabi-objcopy.exe
CFLAGS  += -Wno-psabi -isystem "$(TOOLSDIR)/arm-7.2.0-linux-gnu/arm-linux-gnueabi/include/c++/7.2.0" -isystem "$(SYSROOT)/usr/include" -fsigned-char
LFLAGS  += --sysroot="$(SYSROOT)"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/usr/lib"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/lib"
LFLAGS  += -Wl,--warn-common
#LFLAGS  += -v 
#LFLAGS  += -Wl,-verbose 
endif

ifeq ($(MAKECMDGOALS),clean-arm)
ifeq ($(DEBUG),1)
    OUTDIR = arm-debug
else
    OUTDIR = arm
endif
endif
####################

### arm64 ###########
ifeq ($(MAKECMDGOALS),arm64)
SYSROOT := $(TOOLSDIR)/app-platform-libs/10/arm64
ifeq ($(DEBUG),1)
    OUTDIR = arm64-debug
else
    OUTDIR = arm64
endif
CC       = aarch64-linux-gnu-g++.exe
AR       = aarch64-linux-gnu-ar.exe
OBJCPY   = aarch64-linux-gnu-objcopy.exe
CFLAGS  += -Wno-psabi -isystem "$(TOOLSDIR)/aarch64-7.2.0-linux-gnu/aarch64-linux-gnu/include/c++/7.2.0" -isystem "$(SYSROOT)/usr/include" -fsigned-char
LFLAGS  += --sysroot="$(SYSROOT)"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/usr/lib"
LFLAGS  += -Wl,-rpath,"$(SYSROOT)/lib"
LFLAGS  += -Wl,--warn-common
#LFLAGS  += -v 
#LFLAGS  += -Wl,-verbose 

ifdef __SOFTWARE_PHONE__
# this is needed to make the js libs visible in the client url space
HTTPFILES-WEB-FLAGS=
# use libs for the phone platform
SYSROOT  = $(TOOLSDIR)/phone-platform-libs/1
SYSROOT  = $(TOOLSDIR)/yocto-libs/1
# this is needed to call old version1 ssl functions on a platform with openssl3
CFLAGS	+= -Wno-deprecated-declarations
endif

endif

ifeq ($(MAKECMDGOALS),clean-arm64)
ifeq ($(DEBUG),1)
    OUTDIR = arm64-debug
else
    OUTDIR = arm64
endif
endif
####################

ifeq ($(MAKE_SDK),1)
    OUTBIN = sdk-out/sdk/lib/$(OUTDIR)
    OUTSDK = $(OUTBIN)
else
    OUTBIN = $(OUTDIR)
    OUTSDK = sdk/lib/$(OUTDIR)
endif

bins = $(OUTDIR) $(OUTDIR)/dep $(OUTDIR)/obj $(OUTBIN)/$(OUT) $(OUTBIN)/$(OUT)/apps 

force: