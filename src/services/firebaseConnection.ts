
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyDG3jzRQcf_3XktmxU6SOuMxw0QNfyGGz8",
  authDomain: "taskzinha.firebaseapp.com",
  projectId: "taskzinha",
  storageBucket: "taskzinha.appspot.com",
  messagingSenderId: "1060361433404",
  appId: "1:1060361433404:web:a81edda9fd2b406baa6e39",
  measurementId: "G-3RDN2NXTWV"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export {db}
