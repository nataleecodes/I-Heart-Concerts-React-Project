import React from 'react';
import firebase, { auth, provider } from 'firebase';
import { BrowserRouter as Router, Route, Link, NavLink, browserHistory } from "react-router-dom";
// import { createBrowserHistory } from "history";

class WelcomePage extends React.Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false
    }
    this.loginWithGoogle = this.loginWithGoogle.bind(this);
  }
  
  loginWithGoogle() {
    console.log('clicked');
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {

        this.setState({

          loggedIn: true
        }, () => {

          this.props.router.history.push('/Homepage');
        })
      })
      // this will catch an error, its a promise method
      .catch((err) => {
        console.log(err);
      });

  }

  render() {
    return (
      <div>
        <h1>Welcome to I Heart Concerts!</h1>
        <h2>One place to search for upcoming concerts by your favourite artists and keep a journal of memories from past concerts you've attended!</h2>
        <button onClick={this.loginWithGoogle}>Login with Google</button>
      </div>
    )
  } 
}

export default WelcomePage;