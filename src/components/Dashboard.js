// LIBRARIES
import React, { Component } from "react";
import classnames from "classnames";

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
    loading: false,
    focused: null
  };
  
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
