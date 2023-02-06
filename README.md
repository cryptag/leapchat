# LeapChat

LeapChat is an ephemeral chat application.  LeapChat uses
[miniLock](https://minilock.io) for challenge/response-based
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


### macOS Instructions

If you don't already have Postgres 9.5 to Postgres 12 installed and
running, install it with Homebrew:

```
brew install postgresql@10
```

(It may ask you to append a line to your shell config; watch for this
and follow those instructions.)

Next, you'll need three terminals.

**In the first terminal**, run database migrations, download `postgrest`,
and have `postgrest` connect to Postgres:

```
cd $(go env GOPATH)/src/github.com/cryptag/leapchat/db
chmod a+rx ~/
createdb
sudo -u $USER bash init_sql.sh
wget https://github.com/PostgREST/postgrest/releases/download/v7.0.0/postgrest-v7.0.0-osx.tar.xz
tar xvf postgrest-v7.0.0-osx.tar.xz
./postgrest postgrest.conf
```

If you get an error, make sure that Postgres is running.  On macOS,
run Postgres by running

```
pg_ctl -D /usr/local/var/postgres start
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
npm run dev
```

LeapChat's dev server should now be running on
<http://localhost:5000> !  (And the Go backend on
<http://localhost:5001> .)


#### macOS: Once you're set up

...then run in 3 different terminals:

```
cd db
pg_ctl -D /usr/local/var/postgres start
./postgrest postgrest.conf
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


### Production Deployment Build

Same as the Linux commands above, with two modifications.

Replace:

```
npm run dev
```

with

```
go build
npm run build
```

Replace:

```
go build
./leapchat
```

with

```
go build
sudo setcap cap_net_bind_service=+ep leapchat
./leapchat -prod -domain www.leapchat.org -http :80 -https :443 -iframe-origin www.leapchat.org 2>&1 | tee -a logs.txt
```


## Testing

We use [mocha](https://mochajs.org/) as the testing framework, with
[chai](http://chaijs.com/)'s expect API.

To run tests:

``` $ npm test ```

and go tests:

``` $ go test [-v] ./... ```


# Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See <http://www.wassenaar.org/> for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.
