import firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
  apiKey: "AIzaSyAvQyZ8ZDnoNOkXReUgwH1jLD109UNFXpc",
  authDomain: "flash-chat-279f3.firebaseapp.com",
  databaseURL: "https://flash-chat-279f3.firebaseio.com",
  projectId: "flash-chat-279f3",
  storageBucket: "flash-chat-279f3.appspot.com",
  messagingSenderId: "448395993003",
  appId: "1:448395993003:web:6abb3ddfdc7f5d95107cee",
  measurementId: "G-NKN83TDX68"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();