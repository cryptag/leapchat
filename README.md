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


# Development / Running

## Dependencies

#### Postgres

To install Postgres along with the relevant extensions on Debian-based
Linux distros, run

``` $ bash debian_install.sh ```

On Fedora and friends you can run

```$ bash fedora_install.sh ```

On Mac OS, run

``` $ brew install postgresql ossp-uuid ```


#### PostgREST

On Linux, download the latest
[PostgREST release](https://github.com/begriffs/postgrest/releases)
and put it in your PATH.

On Mac OS, either do the same or use `homebrew` to install it with

``` $ brew install postgrest ```


## Install and Run Using Docker and Docker Compose

(If you'd rather not use Docker/Docker Compose, see next section
instead.)

Instead of intalling Postgres and PostgREST you can run it in docker with docker compose.
Make sure you have Docker installed with Docker Compose. Then run:

``` $ docker-compose up ```

This will pull some images from Docker Hub and start the following
containers:

- Postgres at port 5432
- PostgREST at port 3000
- Adminer at port 8082

Adminer is a web UI for managing SQL databases. After the containers
are installed and started, go to `localhost:8082`.

From there you can choose postgres as the database engine and the
login with hostname `postgres`, username and password `superuser` and
database `leapchat`.  In here you can execute the initial scripts for
the database. This you only need to do once.

A folder is created at the projects root called
`_docker-volumes/`. This is where all the data from e.g the postgres
container are placed.  Here the actual database files will be stored.

Once your conatiners are running and you have setup the initial
database scripts you can access postgREST at `localhost:3000`.

If you want to shut down the containers just run:

``` $ docker-compose down ```

If you want to force rebuild of the images just run:

``` $ docker-compose up --build ```

If you want to remove the containers just run:

``` $ docker-compose rm ```


## Install and Run

To install and build static assets:

``` $ npm install ```


To build the frontend run the following:

``` $ npm run dev ```

With the `dev` command, webpack is used to build the frontend and it
will automatically rebuild it when you make changes to something in
the `./src` directory.

Then, in another terminal, to set up the database and run PostgREST,
which our Go code uses for persistence, run (unless you run it in
Docker, see above):

``` $ cd db/ ```

If you're on Linux, now run

``` $ sudo -u postgres bash init_sql.sh ```

On Mac OS X, instead run

``` $ sudo -u $USER bash init_sql.sh ```

(The following commands should be run regardless of whether you're on
Linux or OS X.)

``` $ postgrest postgrest.conf ```

Then, in another terminal session run:

``` $ go get ./... ```

(An error about not finding `github.com/cryptag/leapchat` is OK here.)

``` $ go build ```

``` $ npm run be ```

Then view <http://localhost:8080>.


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
