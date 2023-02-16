build:
	go build
	npm run build

release: check-env
	@echo 'Hopefully "git diff" is empty!'
	@echo 'Creating release for version $(version) ...'
	@echo 'Manually change the version in these 2 files to $(version) and I, your loyal, Makefile, shall do the rest!'
	@emacsclient -t package.json
	@emacsclient -t package-lock.json
	@git add -p package.json package-lock.json
	@git commit -m 'Version bump to v$(version)'
	@git tag v$(version)
	@git push --tags origin develop

deploy: check-env
	@tar zcvpf releases/leapchat-v$(version)-$$(mydate.sh).tar.gz ./leapchat ./db ./build
	$(MAKE) upload

upload:
	@scp $$(ls -t releases/*.tar.gz | head -1) leapchat-minishare:~/gocode/src/github.com/cryptag/leapchat/releases/
	@ssh leapchat-minishare

check-env:
ifndef version
	$(error "version" variable is undefined; re-run with "version=1.2.3" or similar)
endif
