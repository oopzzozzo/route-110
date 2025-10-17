all: view
punch:
	hugo
	time rsync -r public/* punch:/volume1/web/route-110/

view:
	hugo server
draft:
	hugo server -D
clean:
	rm -rf public/*
