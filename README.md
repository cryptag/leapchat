# LeapChat

LeapChat is an ephemeral chat application.  LeapChat uses
[miniLock](https://web.archive.org/web/20180508023310/https://minilock.io/) for challenge/response-based
authentication. This app also enables users to create chat rooms,
invite others to said rooms (via a special URL with a passphrase at
the end of it that is used to generate a miniLock keypair), and of
course send (encrypted) messages to the other chat room participants.


## Security Features

- All messages are encrypted end-to-end

- The server cannot see anyone's usernames, which are encrypted and
  attached to each message

- Users can "leap" from one room to the next so that if an adversary
  clicks on an old invite link, it cannot be used to join the room
  - (Feature coming soon!)

- [Very secure headers](https://securityheaders.io/?q=https%3A%2F%2Fwww.leapchat.org&followRedirects=on)
  thanks to [gosecure](https://github.com/cryptag/gosecure).

- TODO (many more)


## Instances

There is currently one public instance running at
[leapchat.org](https://www.leapchat.org).


# Running LeapChat

## Getting Started

### Install Go

If you're on Linux or macOS _and_ if don't already have
[Go](https://golang.org/dl/) version 1.14 or newer installed
(`$ go version` will tell you), you can install Go by running:

```
curl https://raw.githubusercontent.com/elimisteve/install-go/master/install-go.sh | bash
source ~/.bashrc
```

Then grab and build the `leapchat` source:

```
go get github.com/cryptag/leapchat
```

### JavaScript and Node Setup

Install Node v14. We recommend using the [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) package
to manage your node environments.

If you're using NVM, you can install the correct node version by running:

```
nvm install   # run from inside of leapchat/ dir, uses .nvmrc file
nvm install v14.0.0   # run from anywhere
```

Then, to configure the use of the correct node version whenever you enter the project:

```
cd ~/code/leapchat && nvm use
```

To install JavaScript dependencies:

```
npm install
```

In development, when you want to see your frontend code changes immediately on a browser refresh, run
the command that boots up a watch process to re-compile the frontend whenever a file changes:

```
npm run dev
```

In order to do a one-time build of the production assets:

```
npm run build
```

The frontend is served through an HTTP server running in the go binary. This allows us to make API requests
from the browser without any CORS configuration.

### macOS Instructions

If you don't already have Postgres 9.5 to Postgres 12 installed and
running, install it with Homebrew:

```
brew install postgresql@12
```

(It may ask you to append a line to your shell config; watch for this
and follow those instructions.)

Next, you'll need three terminals.

**In the first terminal**, run database migrations, download `postgrest`,
and have `postgrest` connect to Postgres:

Start the PostgreSQL server:

```
brew services start postgresql@12
```

Then, create the default database and run the migrations.

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat/db
chmod a+rx ~/
createdb
sudo -u $USER bash init_sql.sh
```

We use [PostgREST](https://postgrest.org/en/stable/) to expose the database to the application.
PostgREST provides a REST API interface that maps to the underlying tables.

To install and run the REST API with the LeapChat configuration file:

```
brew install postgrest
postgrest db/postgrest.conf
```

If you get an error, make sure that Postgres is running. On Mac OS,
you can check PostgreSQL status by running:

```
brew services list
```

**In the second terminal**, run LeapChat's Go backend:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat
go build
./leapchat
```

**In the third terminal**, install JavaScript dependencies and start
LeapChat's auto-reloading dev server:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat
npm install
npm run dev
```

LeapChat's dev server should now be running on <http://localhost:8080>!


#### macOS: Once you're set up

...then run in 3 different terminals:

```
brew services start postgresql@12
postgrest db/postgrest.conf
```

```
./leapchat
```

```
npm run dev
```

### Linux Instructions (for Ubuntu; works on Debian if other dependencies met)

If you don't already have Node 14.x installed (`node --version` will tell
you the installed version), install Node by running:

```
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install nodejs
```


If you don't already have Postgres 9.5 or newer installed and running,
install it by running:

```
sudo apt-get install postgresql postgresql-contrib
```

Next, you'll need three terminals.

**In the first terminal**, run database migrations, download `postgrest`,
and have `postgrest` connect to Postgres:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat/db
chmod a+rx ~/
sudo -u postgres bash init_sql.sh
wget https://github.com/PostgREST/postgrest/releases/download/v7.0.0/postgrest-v7.0.0-ubuntu.tar.xz
tar xvf postgrest-v7.0.0-ubuntu.tar.xz
./postgrest postgrest.conf
```

**In the second terminal**, run LeapChat's Go backend:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat
go build
./leapchat
```

**In the third terminal**, install JavaScript dependencies and start
LeapChat's auto-reloading dev server:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat
npm install
npm run build
npm run start
```

LeapChat should now be running at <http://localhost:8080> !


#### Linux: Once you're set up

...then run in 3 different terminals:

```
cd db
./postgrest postgrest.conf
```

```
./leapchat
```

```
npm run start
```


### Production Build and Deploy

Make sure you're in the default branch (currently `develop`), and make
sure that `git diff` doesn't return anything, then run these commands
to create a new, versioned release of LeapChat, perform a production
build, then deploy that build to production:

(Be sure to customize `version` to the actual new version number.)

```
make all-deploy version=1.2.3
```

Or to run the build, release, and deploy steps individually:

```
make -B build
make release version=1.2.3
make deploy version=1.2.3
```

If the build and release succeed but the upload (and thus the rest of
the deployment) fails, you can deploy the latest local build (in
`./releases/`) with

```
make upload
```

Once SSH'd in, kill the old `leapchat` process then run

```
cd ~/gocode/src/github.com/cryptag/leapchat
tar xvf $(ls -t releases/*.tar.gz | head -1)
sudo setcap cap_net_bind_service=+ep leapchat
./leapchat -prod -domain www.leapchat.org -http :80 -https :443 -iframe-origin www.leapchat.org 2>&1 | tee -a logs.txt
```

## Documentation Links

Open via `npm`:

```
npm docs bootstrap
npm docs react-bootstrap
npm docs react-icons
```


## JavaScript Testing

### Unit Tests

For unit tests, use [mocha](https://mochajs.org/) as the testing framework and test runner, with
[chai](http://chaijs.com/)'s expect API.

Unit tests are located at `./test/` and have an extension of `.test.js`.

To run unit tests only, run:

```
npm run mocha
```

### Browser Tests

For browser tests, we use [playwright](https://playwright.dev/). This should be installed for you 
via `npm`, but you may need to install the playwright browser have tests run successfully:

```
npx playwright install-deps
```

Browser tests are located at `./test/playwright` and have an extension of `.spec.js`.

To run browser tests only, run:

```
npm run playwright
```

By default, the browser tests run in headless mode. To run with an interactive browser session, run:

```
npm run webtests
```

**To run all of the tests, all together**:

```
npm test
```

### Documentation Links

Playwright has good docs. For quick access, here are some useful links:

[Accessing the DOM with Playwright](https://playwright.dev/docs/api/class-locator)

[Test Assertions with Playwright](https://playwright.dev/docs/test-assertions)

Currently experimental: [Unit Testing React Components with Playwright](https://playwright.dev/docs/test-components)

## Go Testing

To run the golang tests:

``` $ go test [-v] ./... ```


# Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See <http://www.wassenaar.org/> for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.
