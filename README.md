# LeapChat

LeapChat is an ephemeral chat application.  LeapChat uses
[miniLock](https://minilock.io) for challenge/response-based
authentication. This app also enables users to create chat rooms,
invite others to said rooms (via a special URL with a passphrase at
the end of it that is used to generate a miniLock keypair), and of
course send (encrypted) messages to the other chat room participants.


## Security Features

- The server cannot see anyone's usernames

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

If you've yet to install `bower` and `gulp`, run

``` $ npm install -g bower ```

``` $ npm install -g gulp ```

To install Postgres along with the relevant extensions on Debian-based
Linux distros, run

``` $ bash debian_install.sh ```


## Install and Run

To install and build static assets:

``` $ npm install ```

``` $ mkdir build ```

``` $ bower install ```

``` $ npm run build ```

``` $ npm run dev  # watch asset files and recompile when changed ```

Then, to build and run the go binary

``` $ go build ```

``` $ ./leapchat ```

Then view <http://localhost:8080>.

## Testing

We use [mocha](https://mochajs.org/) as the testing framework, with [chai](http://chaijs.com/)'s expect API.

To run tests:

``` $ npm test ```

and go tests:

``` $ go test [-v] ./... ```
