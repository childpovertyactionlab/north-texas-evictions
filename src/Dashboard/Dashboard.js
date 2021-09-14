import React from "react";
import { Box } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { QueryClient, QueryClientProvider } from "react-query";

const Wrapper = withStyles({
  root: {
    position: "relative",
    display: "flex",
    flex: 1,
    alignItems: "stretch",
    justifyContent: "stretch",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
})(Box);

// Create a client
const queryClient = new QueryClient();

const Dashboard = ({ children, ...props }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Wrapper {...props}>{children}</Wrapper>
      </MuiPickersUtilsProvider>
    </QueryClientProvider>
  );
};

Dashboard.defaultProps = {};

Dashboard.propTypes = {};

export default Dashboard;
