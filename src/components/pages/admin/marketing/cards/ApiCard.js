import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Grid,
	CardActions,
	CardContent,
	Card,
	InputAdornment,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	List,
	ListItem,
	Avatar,
	ListItemText
} from "@material-ui/core";
import user from "../../../../../stores/user";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class ApiCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		const { organizationId } = this.props;
	}

	render() {
		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<CardContent>
					<div>
						Please contact your account executive for your API key and developer
						documents to implement custom integrations between Big Neon and your
						owned media properties.
					</div>
				</CardContent>
			</Card>
		);
	}
}

ApiCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(ApiCard);
