punch:
	hugo
	rsync -r public/* punch:/volume1/web/route-110/
clean:
	rm -rf public/*
