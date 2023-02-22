
# Files form the innovaphone JavaScript SDK
FILES += \
	../$(SDK-WEB1)/appwebsocket/innovaphone.appwebsocket.Connection.js \
	../$(SDK-WEB1)/lib1/*.js \
	../$(SDK-WEB1)/lib1/*.css \
	../$(SDK-WEB1)/ui1.lib/*.js \
	../$(SDK-WEB1)/ui1.switch/*.js \
	../$(SDK-WEB1)/ui1.popup/*.js \
	../$(SDK-WEB1)/com.innovaphone.avatar/*.js \
	../$(SDK-WEB1)/ui1.listview/*.js \
	../$(SDK-WEB1)/ui1.svg/*.js \
	../$(SDK-WEB1)/fonts/*.ttf
	
# Files for your app
FILES += \
	httpfiles/*

# Files for the service
FILES	+=	\
	build.txt \
	label.txt \
	config.json \
    plugins.json \
	wecom-novaalertservice.js
