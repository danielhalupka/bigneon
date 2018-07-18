import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	headerImage: {
		width: "100%",
		marginBottom: theme.spacing.unit * 2
	}
});
const Container = props => {
	const { classes, children } = props;

	return (
		<div>
			<Grid container justify="center">
				<Grid item xs={12} sm={10} md={6} lg={4}>
					<img
						alt="Header logo"
						className={classes.headerImage}
						src="/images/bn-logo-text.png"
					/>
				</Grid>
			</Grid>

			<Grid container justify="center">
				<Grid item xs={12} sm={12} md={8} lg={5}>
					<div>
						<Card className={classes.paper}>{children}</Card>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

Container.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.element.isRequired
};

export default withStyles(styles)(Container);
