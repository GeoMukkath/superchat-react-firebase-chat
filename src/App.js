import "./App.css";
import React, { useState, useRef } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCg-MnmS2aEhDBDnbTSCXlu6i1f2nkcMhU",
    authDomain: "react-chat-app-b7c9e.firebaseapp.com",
    projectId: "react-chat-app-b7c9e",
    storageBucket: "react-chat-app-b7c9e.appspot.com",
    messagingSenderId: "724302811981",
    appId: "1:724302811981:web:3435cf4fb3ed00f691dd04",
    measurementId: "G-XTN8G7BRFG",
  });
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth); // Signed in user is an obeject, if signed out user is null.
  return (
    <div className="App">
      <header>
        <h1>✉ Room</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}
// This is the sign-in component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <>
      <button className="signIn_btn" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}
// This is the Chat room component
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(50);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <div ref={dummy}></div>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(event) => setFormValue(event.target.value)}
        />
        <button disabled={!formValue} type="submit">
          🚀
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="user_avatar" />
      <p>{text}</p>
    </div>
  );
}
export default App;
