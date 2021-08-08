# Unit testing security rules with the Firebase Emulator Suite

-  see https://www.youtube.com/watch?v=VDulvfBpzZE
-  this is the introductory lesson

## HOW CREATED

- `firebase init` chose firebase and emulators only rest defaults
- `npm init -y` then set test script to `mocha --exit`
- `npm install mocha --save-dev`
- `npm install @firebase/testing --save-dev`
- `firebase emulators:start` in another shell
