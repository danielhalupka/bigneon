import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "../../elements/Card";

import AppBar from "../../elements/header/AppBar";
import { toolBarHeight } from "../../styles/theme";

const styles = theme => ({
	root: {
		flexGrow: 1,
		zIndex: 1,
		overflow: "hidden",
		position: "relative",
		display: "flex",
		width: "100%",
		height: "100%"
	},
	content: {
		height: "100%",
		flexGrow: 1,
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing.unit * 3,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",

		display: "flex",
		flexDirection: "column",
		justifyContent: "center",

		paddingTop: theme.spacing.unit * 2
	},
	background: {
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundColor: "#19081e",
		backgroundImage: `url(/images/intro-background-dark.png)`
	},
	paper: {
		padding: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 25,
		textAlign: "center",
		[theme.breakpoints.down("sm")]: {
			padding: theme.spacing.unit * 2
		}
	},
	headerImage: {
		width: "100%"
	},
	toolbar: toolBarHeight
});

const Container = props => {
	const { classes, children, type, history } = props;

	return (
		<div className={classes.root}>
			<AppBar history={history}/>

			<main className={classnames(classes.content, classes.background)}>
				<div className={classes.toolbar}/>

				<Grid container justify="center">
					<Grid item xs={12} sm={12} md={6} lg={4}>
						<Card
							iconUrl="/icons/user-white.svg"
							variant="raised"
							className={classes.paper}
						>
							{children}
						</Card>
					</Grid>
				</Grid>
			</main>
		</div>
	);
};

Container.propTypes = {
	history: PropTypes.object.isRequired,
	type: PropTypes.oneOf(["login", "signup"]),
	classes: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired
};

export default withStyles(styles)(Container);
