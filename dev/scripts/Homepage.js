import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, NavLink, browserHistory } from "react-router-dom";
import firebase, { auth, provider } from 'firebase';
import ShowItem from './ShowItem';
import JournalItem from './JournalItem';

var config = {
  apiKey: "AIzaSyBEqlA21ilIP2aDVHm6KhvprRhz6xkyG4k",
  authDomain: "iheartconcerts-80ab6.firebaseapp.com",
  databaseURL: "https://iheartconcerts-80ab6.firebaseio.com",
  projectId: "iheartconcerts-80ab6",
  storageBucket: "iheartconcerts-80ab6.appspot.com",
  messagingSenderId: "790151033211"
};

firebase.initializeApp(config);

class Homepage extends React.Component {

  constructor() {
    super();
    this.state = {
      artistName: '',
      allShows: [],
      imageArtist: '',
      postedName: '',
      notOnTour: false,
      loggedIn: false,
      displayName: '',
      displayPhoto: '',
      artistSeen: '',
      seenDate: '',
      seenLocation: '',
      seenMemory: '',
      artistsSeen: [],
      userId: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitUpcoming = this.handleSubmitUpcoming.bind(this);
    this.handleSubmitJournal = this.handleSubmitJournal.bind(this);
    this.logout = this.logout.bind(this);
    this.removeJournal = this.removeJournal.bind(this);
  }

  logout() {
    firebase.auth().signOut();
    this.setState({
      allShows: [],
      userId: '',
      displayName: '',
      displayPhoto: '',
      loggedIn: false,
      artistsSeen: []
    });
  }

  // check on load if there is a user logged in already, if so set the states accordingly
  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        console.log('user logged in');
        this.setState({
          loggedIn: true,
          displayPhoto: user.photoURL,
          displayName: user.displayName,
          userId: user.uid,
        })
      } else {
        console.log('no users logged in');
      }
    });
  }

  // Checking if we already have the users information from firebase
  componentDidMount() {
    // this method gets a user passed, if theres a user
    firebase.auth().onAuthStateChanged((user) => {
      // console.log(user);
      if (user !== null) {
        firebase.database().ref(`users/${this.state.userId}`)
          // console.log(user);
          // theres no data for the user to get, we need to allow them to get the access to the data when they login
          .on('value', (snapshot) => {
            const data = snapshot.val();
            // console.log(data);
            const journalArray = [];

            for (let item in data) {
              data[item].key = item;
              journalArray.push(data[item])
              console.log(journalArray);
            }
            this.setState({
              artistsSeen: journalArray
            })
          })
        this.setState({
          loggedIn: true,
        })
      } else {
        this.setState({
          loggedIn: false
        });
      }
    })
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmitUpcoming(e) {
    e.preventDefault();
    this.setState({
      allShows: [],
      artistName: ''
    })
    let theArtist = ''
    theArtist = this.state.artistName;
    console.log(theArtist);
    axios({
      url: `https://rest.bandsintown.com/artists/${theArtist}/`,
      params: {
        app_id: `6e7ce2bb9f77b677bc181759630ddcf4`
      }
    })
      .then((res) => {
        console.log(res.data);
        this.setState({
          imageArtist: res.data.image_url,
          postedName: res.data.name,
        })
      })
    axios({
      url: `https://rest.bandsintown.com/artists/${theArtist}/events/`,
      params: {
        app_id: `6e7ce2bb9f77b677bc181759630ddcf4`
      }
    })
      .then((res) => {
        // console.log('yes');
        console.log(res.data);
        let allShowsClone = Array.from(this.state.allShows);
        allShowsClone.push(res.data);
        this.topShows(allShowsClone);
      })
  }

  topShows(allShowsClone) {
    let finalShows = allShowsClone[0].slice(0, 6);
    console.log(finalShows);
    this.dateToString(finalShows)
    console.log(allShowsClone)
    {allShowsClone[0].length === 0 ? 
      this.setState({
        notOnTour: true
      }): 
      this.setState({
        allShows: finalShows,
        notOnTour: false
      })
    }
  }

  // dont set state in top shows 
  dateToString(finalShows) {
    for (let index = 0; index < finalShows.length; ++index) {
      const sliceTime = finalShows[index].datetime.slice(11);
      // console.log(sliceTime);
      const sliceDate = finalShows[index].datetime.slice(0, 10);
      // console.log(sliceDate);
      const sliceDay = sliceDate.slice(8, 10);
      // console.log(sliceDay);
      const sliceMonth = sliceDate.slice(5, 7);
      // console.log(sliceMonth);
      const sliceYear = sliceDate.slice(0, 4);
      // console.log(sliceYear);

      let finalDate = {
        month: sliceMonth,
        day: sliceDay,
        year: sliceYear,
        time: sliceTime
      }
      console.log(finalDate);
      // finalShows.push(finalDate)
    }
    return
    // allShows.push(finalDate)
    // this.setState({
    //   allShows: finalShows
    // })
    // Then we can use that to set state and display the date we want
  }

  handleSubmitJournal(e) {
    e.preventDefault();
    const userSeen = {
      artist: this.state.artistSeen,
      date: this.state.seenDate,
      location: this.state.seenLocation,
      memory: this.state.seenMemory
    }
    const dbRef = firebase.database().ref(`users/${this.state.userId}`);
    dbRef.push(userSeen);
    console.log(dbRef);

    this.setState({
      artistSeen: '',
      seenDate: '',
      seenLocation: '',
      seenMemory: '',
    })
  }

  removeJournal(journalToRemove) {
    console.log('hi');
    firebase.database().ref(`users/${this.state.userId}/${journalToRemove}`).remove();
  }

  render() {
    return (
      <div>
        <div >
          {this.state.loggedIn === true &&
            <div className="homepageWallpaper" >
              <div className="homepageWrapper">
                <div className="signInInfo">
                  <button className="logoutButton" onClick={this.logout}>Logout</button>
                  <img className="googlePhoto" src={this.state.displayPhoto} alt="A photo from your google" />
                </div>
                <h1>I Heart Concerts</h1>
                <div>
                  <h2>Hi, {this.state.displayName}</h2>
                </div>
                <form className="bandSearchForm" onSubmit={this.handleSubmitUpcoming}>
                  <h2>Upcoming Concerts</h2>
                  <p>Search for shows from your favourite artist.</p>
                  <input required type="text" name="artistName" value={this.state.artistName} onChange={this.handleChange} placeholder="Artist" />
                  <input type="submit" value="Artist Search" />
                  <div className="artistNameImg" >
                    <h3>{this.state.postedName}</h3>
                    <img src={this.state.imageArtist} alt="" />
                  </div>
                  {this.state.notOnTour === true &&
                    <p>Sorry, this artist is not on tour. Please search again!</p>
                  }
                  <ul className="showList">
                    {this.state.allShows.map((showItem, i) => {
                      return <ShowItem
                        key={i}
                        venue={showItem.venue.name} //Check 2-level-deep labels -ok?
                        city={showItem.venue.city}
                        date={showItem.datetime}
                        url={showItem.offers[0].url}
                      />
                    })}
                  </ul>
                </form>

                <form className="journalForm" onSubmit={this.handleSubmitJournal}>
                  <h2>Your Concert Journal</h2>
                  <p>A place for memories and bragging rights!</p>
                  <div className="journalInputs" >
                    <label htmlFor="artist">Artist Name</label>
                    <input type="text" name="artistSeen" id="artist" value={this.state.artistSeen} onChange={this.handleChange} />

                    <label htmlFor="date">Date of the Concert</label>
                    <input type="text" id="date" name="seenDate" value={this.state.seenDate} onChange={this.handleChange} />

                    <label htmlFor="location">Location of the Concert</label>
                    <input type="text" id="location" name="seenLocation" value={this.state.seenLocation} onChange={this.handleChange} />

                    <label htmlFor="memory">A memory from the Concert</label>
                    <textarea name="memory" id="memory" name="seenMemory" value={this.state.seenMemory} onChange={this.handleChange}></textarea>
                    <input type="submit" value="Add Entry" />
                  </div>
                  <h2>Artists {this.state.displayName} has seen in concert!</h2>
                  <ul className="journalList">
                    {this.state.artistsSeen.map((journal) => {
                      return <JournalItem
                        key={journal.key}
                        firebaseKey={journal.key}
                        removeJournal={this.removeJournal}
                        artist={journal.artist}
                        date={journal.date}
                        location={journal.location}
                        memory={journal.memory}
                      />
                    })}
                  </ul>
                </form>
              </div>
            </div>
          }
          {this.state.loggedIn === false &&
            <div className="welcomeWallpaper">
              <div className="welcomeWrapper">
                <div className="welcomePage goodbyePage">
                  <h2>Thank you for visiting. See you on the dancefloor!</h2>
                  <img src="assets/logo-final.svg" alt="I Heart Concerts Logo" />
                  <p>Made by <a href="http://www.clintdevs.live" target="_blank" >Clint Lee</a> <a href="https://www.mikaelamade.com" target="_blank" >Mikaela Scornaienchi</a> <a href="http://www.nataleecodes.com" target="_blank" >Natalee Blagden</a></p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Homepage;