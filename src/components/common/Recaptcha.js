import React from "react";
import RecaptchaComponent from "react-grecaptcha";

const sitekey = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;

// https://github.com/evenchange4/react-grecaptcha
const Recaptcha = props =>
	sitekey ? <RecaptchaComponent {...props} sitekey={sitekey} /> : <span />;

export default Recaptcha;
