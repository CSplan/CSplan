nodebin=node_modules/.bin

PORT=3030

build:
	env NODE_ENV=production $(nodebin)/vite build
	./scripts/prepare-static.sh
.PHONY: build

production: build
.PHONY: production

staging:
	env NODE_ENV=production $(nodebin)/vite build --mode=staging
	./scripts/prepare-static.sh
.PHONY: staging

dev:
	env NODE_ENV=development $(nodebin)/vite dev --port=$(PORT)
	./scripts/prepare-static.sh
.PHONY: dev

lint:
	$(nodebin)/eslint src
.PHONY: lint

check: ts-check svelte-check
.PHONY: check

ts-check:
	$(nodebin)/tsc --noemit
.PHONY: ts-check

svelte-check:
	$(nodebin)/svelte-check --use-new-transformation true --compiler-wranings css-unused-selector:ignore
.PHONY: svelte-check
