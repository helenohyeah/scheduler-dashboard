// LIBRARIES
import React, { Component } from "react";
import classnames from "classnames";
import axios from "axios";

// HELPER FUNCTIONS
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";
import { setInterview } from "helpers/reducers";

// COMPONENTS
import Loading from "./Loading";
import Panel from "./Panel";

// DATA
const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
]; 

class Dashboard extends Component {

  // DECLARE STATE AND INITIAL VALUES
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  };
  
  // ON MOUNT METHOD
  componentDidMount() {

    // GET DATA FROM SERVER
    axios.defaults.baseURL = "http://localhost:9000";
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([ days, appointments, interviewers ]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    }).catch(err => console.log("Error with GET: ", err));

    // WEBSOCKET TO ADD UPDATES REALTIME
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    // LISTEN FOR CHANGES TO UPDATE STATE
    this.socket.onmessage = event => {
      console.log('socket listening')
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    }; 

    // CHECK LOCAL STORAGE FOR SAVED FOCUS STATE
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }
  }

  // ON STATE CHANGE METHOD
  componentDidUpdate(previousProps, previousState) {
    // SAVE FOCUS TO LOCAL STORAGE WHEN STATE CHANGES
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }
  
  // WHEN COMPONENT UNMOUNTS
  componentWillUnmount() {
    // CLEAN UP WEBSOCKET CONNECTION
    this.socket.close();
  }

  // TOGGLE PANEL METHOD
  selectPanel (id) {
    this.setState({
      focused: id === this.state.focused ? null : id
    });
   }

  // RENDER METHOD (RUNS EVERYTIME)
  render() {
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
    });
    
    // SHOW LOADING
    if (this.state.loading) {
      return <Loading />;
    }

    // FILTER DATA THEN CREATE PANELS
    const panels = data
      .filter(panel => this.state.focused === null || this.state.focused === panel.id)
      .map(panel => {
        return (
          <Panel
            key={panel.id}
            id={panel.id}
            label={panel.label}
            value={panel.getValue(this.state)}
            onSelect={e => this.selectPanel(panel.id)}
          />
        );
      });

    return (
      <main className={dashboardClasses}>
        {panels}
      </main>
    );
  }
}

export default Dashboard;
