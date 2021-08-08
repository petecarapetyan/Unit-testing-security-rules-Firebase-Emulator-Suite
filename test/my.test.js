
const assert = require ('assert')
const firebase = require ('@firebase/testing')
const { test } = require('mocha')

const MY_PROJECT_ID = "fauxmazon"
const MY_UID = "user_abc"
const THEIR_UID = "user_xyz"
const MY_AUTH = {uid: MY_UID, email: "abc@gmail.com"}
const THEIR_AUTH = {uid: THEIR_UID, email: "xyz@gmail.com"}
const PUBLIC_POST_ID = "public_post"
const PRIVATE_POST_ID = "private_post"

function getFirestore(auth) {
  return  firebase.initializeTestApp({ projectId: MY_PROJECT_ID, auth }).firestore();
}

function getAdminFirestore() {
  return firebase.initializeAdminApp({ projectId: MY_PROJECT_ID }).firestore()
}


beforeEach( async() => {
  await firebase.clearFirestoreData( { projectId: MY_PROJECT_ID } )
}) 

describe ("my first test", () => {

  it("can read items in readonly firestore document", async () => {
    const db = getFirestore(null)
    const testDoc = db.collection("readonly").doc("testDoc");
    await firebase.assertSucceeds(testDoc.get())
  })

  it("can read items in readonly firestore document", async () => {
    const db = getFirestore(null)
    const testDoc = db.collection("readonly").doc("testDoc");
    await firebase.assertFails(testDoc.set({foo:"bar"}))
  })

  it("can write to a document with the same userId as our user", async () => {
    const auth = MY_AUTH
    const db = getFirestore(auth)
    const testDoc = db.collection("users").doc(MY_UID);
    await firebase.assertSucceeds(testDoc.set({foo:"bar"}))
  })

  it("cannot write to a document with the different userId as our user", async () => {
    const auth = THEIR_AUTH
    const db = getFirestore(auth)
    const testDoc = db.collection("users").doc(MY_UID);
    await firebase.assertFails(testDoc.set({foo:"bar"}))
  })

  it("can read all posts marked public", async () => {
    const db = getFirestore(null)
    const testQuery = db.collection("posts").where("visibility","==", "public");
    await firebase.assertSucceeds(testQuery.get())
  })

  it("can read post written by user", async () => {
    const auth = MY_AUTH
    const db = getFirestore(auth)
    const testQuery = db.collection("posts").where("authorId","==", MY_UID);
    await firebase.assertSucceeds(testQuery.get())
  })

  it("can't read all posts", async () => {
    const auth = MY_AUTH
    const db = getFirestore(auth)
    const testQuery = db.collection("posts");
    await firebase.assertFails(testQuery.get())
  })

  it("can read a public post with other auth", async () => {
    const admin = getAdminFirestore()
    const setupDoc = admin.collection("posts").doc(PUBLIC_POST_ID)
    await setupDoc.set({authorId: THEIR_UID, visibility: "public"})
    const db = getFirestore(MY_AUTH)
    const testRead = db.collection("posts").doc(PUBLIC_POST_ID);
    await firebase.assertSucceeds(testRead.get())
  })


  it("cannot read a private post with other auth", async () => {
    const admin = getAdminFirestore()
    const setupDoc = admin.collection("posts").doc(PRIVATE_POST_ID)
    await setupDoc.set({authorId: THEIR_UID, visibility: "private"})
    const db = getFirestore(MY_AUTH)
    const testRead = db.collection("posts").doc(PRIVATE_POST_ID);
    await firebase.assertFails(testRead.get())
  })

  it("can read a private post with own auth", async () => {
    const ANOTHER = "anotherPrivatePost"
    const admin = getAdminFirestore()
    const setupDoc = admin.collection("posts").doc(ANOTHER)
    await setupDoc.set({authorId: MY_UID, visibility: "private"})
    const db = getFirestore(MY_AUTH)
    const testRead = db.collection("posts").doc(ANOTHER);
    await firebase.assertSucceeds(testRead.get())
  })

})

after( async() => {
  await firebase.clearFirestoreData( { projectId: MY_PROJECT_ID } )
})