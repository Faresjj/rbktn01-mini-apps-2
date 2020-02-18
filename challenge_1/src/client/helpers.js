import axios from "axios";
// import {connect} from 'react-redux';

const getEvents = (term, page = 1) => {
  return axios
    .get("/events", {
      params: {
        _page: page,
        _limit: 10,
        q: term
      }
    })
    .then(results => results.data)
    .catch(err => console.error(err));
};

export default getEvents;