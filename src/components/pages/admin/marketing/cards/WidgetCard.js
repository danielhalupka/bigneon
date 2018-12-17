import React, { Component } from "react";
import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import user from "../../../../../stores/user";
import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class InviteUserCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			orgMembers: [],
			errors: {},
			isSubmitting: false,
			styleString: "#bn-event-list {padding-top: 80px;max-width: 1200px;margin: auto;} #bn-event-list h1 {margin: 0px auto 80px auto;text-shadow: 0 0 3px #ededed;} .event-container {display: grid;grid-template-columns: 300px 1fr 100px;grid-column-gap: 20px;height: 200px;width: 100%;padding: 0px 80px;margin: 40px 0px;} .event-image {position: relative;bottom: 40px;} .event-image img {width: 300px;height: 150px;} .event-button {text-align: right;} .event-button button {display: block;clear: both;padding: 0px 20px;margin-bottom: 10px;} .event-text {margin: 0px;color: #ededed;} .event-date {color: #ededed;font-size: 20px;text-transform: uppercase;margin-bottom: 10px;} .event-time {color: #ededed;font-size: 14px;} .event-price {color: #ededed;font-size: 14px;display: block;clear: both;text-transform: uppercase;} .event-date-mobile {display: none;} .event-promoter {font-size: 14px;text-transform: uppercase;} .event-artists {font-size: 24px;text-transform: uppercase;margin-bottom: 10px;} .event-link {text-decoration: none;} @media (max-width: 900px) {.event-container {grid-template-columns: 100px 2fr 100px;padding: 0px 20px;} .event-image {grid-column: 1 / 3;} .event-text {grid-column: 1 / 3;} .event-image img {display: none;} .event-date {display: none;} .event-artists {font-size: 20px;} .event-date-mobile {display: block;color: #ededed;font-size: 20px;text-transform: uppercase;margin-bottom: 10px;}} .buy-button {height: 30px;background: #e75e26;border: none;margin: 0;font-size: 18px;font-weight: 600;text-transform: uppercase;-webkit-transition: background-color .3s, color .7s;-o-transition: background-color .3s, color .7s;transition: background-color .3s, color .7s;} .buy-button:hover {background: #111111;color: #e75e26;}"
		};
	}

	componentDidMount() {
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { email } = this.state;

		const errors = {};

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	render() {
		const { classes } = this.props;
		const { styleString } = this.state;
		const widgetSrcUrl = `${window.location.origin}/widgets/events.min.js`;
		const organizationId = user.currentOrganizationId;
		const baseUrl = window.location.origin;
		let apiUrl = Bigneon().client.params.baseURL;
		if (apiUrl[0] === "/") {
			apiUrl = `${baseUrl}/${apiUrl}`;
		}
		const outputStyleString = styleString.replace(/[\t|\n]*/g, "").replace(/\s{2,}/g, " ");
		const output = `<div id="bn-event-list"></div><style>${outputStyleString}</style>\n<script src="${widgetSrcUrl}" data-target="#bn-event-list" data-organization-id="${organizationId}" data-base-url="${baseUrl}/" data-api-url="${apiUrl}/"></script>`;
		const displayCss = styleString.replace(/\{/g, " {\n\t")        // Line-break and tab after opening {
			.replace(/;([^}])/g, ";\n\t$1")  // Line-break and tab after every ; except
			// for the last one
			.replace(/;\}/g, ";\n}\n\n")     // Line-break only after the last ; then two
			// line-breaks after the }
			.replace(/([^\n])\}/g, "$1;\n}") // Line-break before and two after } that
			// have not been affected yet
			.replace(/,/g, ",\n")            // line break after comma
			.trim();
		return (
			<Card className={classes.paper}>
				<CardContent>
					<p>Copy and paste the following code where you would like the widget to appear:</p>
					<InputGroup
						value={output}
						name={"output"}
						onFocus={(e) => {
							e.target.select();
						}}
						onChange={(e) => {}}
					/>

					<textarea defaultValue={displayCss} style={{ width: "100%", height: "300px" }} onChange={(e) => {
						this.setState({ styleString: e.target.value });
					}}>
					</textarea>
				</CardContent>
			</Card>
		);
	}
}

InviteUserCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(InviteUserCard);
