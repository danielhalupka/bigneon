import axios from 'axios';
console.log(process.env);
export default axios.create({
	baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/`,
	headers: {
	},

});