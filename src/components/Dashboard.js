// LIBRARIES
import React, { Component } from "react";
import classnames from "classnames";
import axios from "axios";

// COMPONENTS
import Loading from "./Loading";
import Panel from "./Panel";

// MOCK HARDCODED DATA
const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
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

    // CHECK LOCAL STORAGE FOR SAVED FOCUS STATE
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }
  }

  // SAVE FOCUS TO LOCAL STORAGE WHEN STATE CHANGES
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  // TOGGLE PANEL FOCUS WHEN WHEN SELECTED
  selectPanel (id) {
    this.setState({
      focused: id === this.state.focused ? null : id
    });
   }

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
            value={panel.value}
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
