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
			styleString: "I2JuLWV2ZW50LWxpc3Qge3BhZGRpbmctdG9wOiA4MHB4O21heC13aWR0aDogMTIwMHB4O21hcmdpbjogYXV0bzt9I2JuLWV2ZW50LWxpc3QgaDEge21hcmdpbjogMHB4IGF1dG8gODBweCBhdXRvO3RleHQtc2hhZG93OiAwIDAgM3B4ICNlZGVkZWQ7fSNsb2FkLW1vYXItZXZlbnRzIHtkaXNwbGF5OiBibG9jazt0ZXh0LWFsaWduOiBjZW50ZXI7bWFyZ2luLWJvdHRvbTogNDBweDt9LyogUG9zaXRpb25pbmcgKi8uZXZlbnQtY29udGFpbmVyIHtkaXNwbGF5OiBncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczogMzAwcHggMWZyIDEwMHB4O2dyaWQtY29sdW1uLWdhcDogMjBweDtoZWlnaHQ6IDIwMHB4O3dpZHRoOiAxMDAlO3BhZGRpbmc6IDBweCA4MHB4O21hcmdpbjogNDBweCAwcHg7fS5ldmVudC1pbWFnZSB7cG9zaXRpb246IHJlbGF0aXZlO2JvdHRvbTogNDBweDt9LmV2ZW50LWltYWdlIGltZyB7d2lkdGg6IDMwMHB4O2hlaWdodDogMTUwcHg7fS5ldmVudC1idXR0b24ge3RleHQtYWxpZ246IHJpZ2h0O30uZXZlbnQtYnV0dG9uIGJ1dHRvbiB7ZGlzcGxheTogYmxvY2s7Y2xlYXI6IGJvdGg7cGFkZGluZzogMHB4IDIwcHg7bWFyZ2luLWJvdHRvbTogMTBweDt9LyogVGV4dCBGb3JtYXR0aW5nICovLmV2ZW50LXRleHQge21hcmdpbjogMHB4O2NvbG9yOiAjZWRlZGVkO30uZXZlbnQtZGF0ZSB7Y29sb3I6ICNlZGVkZWQ7Zm9udC1mYW1pbHk6ICdPc3dhbGQnO2ZvbnQtc2l6ZTogMjBweDt0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO21hcmdpbi1ib3R0b206IDEwcHg7fS5ldmVudC10aW1lIHtjb2xvcjogI2VkZWRlZDtmb250LWZhbWlseTogJ09zd2FsZCc7Zm9udC1zaXplOiAxNHB4O30uZXZlbnQtcHJpY2Uge2NvbG9yOiAjZWRlZGVkO2ZvbnQtZmFtaWx5OiAnT3N3YWxkJztmb250LXNpemU6IDE0cHg7ZGlzcGxheTogYmxvY2s7Y2xlYXI6IGJvdGg7dGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTt9LmV2ZW50LWRhdGUtbW9iaWxlIHtkaXNwbGF5OiBub25lO30uZXZlbnQtcHJvbW90ZXIge2ZvbnQtZmFtaWx5OiAnUmFqZGhhbmknO2ZvbnQtc2l6ZTogMTRweDt0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO30uZXZlbnQtYXJ0aXN0cyB7Zm9udC1mYW1pbHk6ICdPc3dhbGQnO2ZvbnQtc2l6ZTogMjRweDt0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO21hcmdpbi1ib3R0b206IDEwcHg7fS5ldmVudC1saW5rIHt0ZXh0LWRlY29yYXRpb246IG5vbmU7fS8qIFJlc3BvbnNpdmUgRGVzaWduICovQG1lZGlhIChtYXgtd2lkdGg6IDkwMHB4KSB7LmV2ZW50LWNvbnRhaW5lciB7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxMDBweCAyZnIgMTAwcHg7cGFkZGluZzogMHB4IDIwcHg7fS5ldmVudC1pbWFnZSB7Z3JpZC1jb2x1bW46IDEgLyAzO30uZXZlbnQtdGV4dCB7Z3JpZC1jb2x1bW46IDEgLyAzO30uZXZlbnQtaW1hZ2UgaW1nIHtkaXNwbGF5OiBub25lO30uZXZlbnQtZGF0ZSB7ZGlzcGxheTogbm9uZTt9LmV2ZW50LWFydGlzdHMge2ZvbnQtc2l6ZTogMjBweDt9LmV2ZW50LWRhdGUtbW9iaWxlIHtkaXNwbGF5OiBibG9jaztjb2xvcjogI2VkZWRlZDtmb250LWZhbWlseTogJ09zd2FsZCc7Zm9udC1zaXplOiAyMHB4O3RleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7bWFyZ2luLWJvdHRvbTogMTBweDt9fS5idXktYnV0dG9uIHtoZWlnaHQ6IDMwcHg7YmFja2dyb3VuZDogI2U3NWUyNjtib3JkZXI6IG5vbmU7bWFyZ2luOiAwO2ZvbnQtZmFtaWx5OiAnUmFqZGhhbmknO2ZvbnQtc2l6ZTogMThweDtmb250LXdlaWdodDogNjAwO3RleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7LXdlYmtpdC10cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIC4zcywgY29sb3IgLjdzOy1vLXRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgLjNzLCBjb2xvciAuN3M7dHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAuM3MsIGNvbG9yIC43czt9LmJ1eS1idXR0b246aG92ZXIge2JhY2tncm91bmQ6ICMxMTExMTE7Y29sb3I6ICNlNzVlMjY7fQ=="
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
		const apiUrl = Bigneon().client.params.baseURL;
		let styleInput = window.atob(styleString);
		const base64Style = window.btoa(styleString.replace(/\n/g, "").replace(/\s{2,}/g, " "));
		const output = `<div id="bn-event-list"></div>\n<script src="${widgetSrcUrl}" data-target="#bn-event-list" data-organization-id="${organizationId}" data-base-url="${baseUrl}/" data-api-url="${apiUrl}/" data-style="${base64Style}"></script>`;
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

					<textarea defaultValue={styleInput} style={{ width: "100%", height: "300px" }} onChange={(e) => {
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
