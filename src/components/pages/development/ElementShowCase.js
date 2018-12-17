import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Card from "../../elements/Card";
import PageHeading from "../../elements/PageHeading";
import Grid from "@material-ui/core/Grid";

const styles = theme => {
	return {};
};

const ElementShowcase = () => {
	return (
		<div>
			<Grid container spacing={16}>
				<Grid item xs={12} sm={12} lg={6}>
					<PageHeading iconUrl="/icons/events-multi.svg">
						PageHeading
					</PageHeading>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="block">
						<Typography variant="headline">Card: variant=block</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="default">
						<Typography variant="headline">Card variant=default</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="raised">
						<Typography variant="headline">Card variant=raised</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="raisedLight">
						<Typography variant="headline">Card variant=raisedLight</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="form">
						<Typography variant="headline">Card variant=form</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="dialog">
						<Typography variant="headline">Card variant=dialog</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="subCard">
						<Typography variant="headline">Card variant=subCard</Typography>
					</Card>
				</Grid>
				<Grid item xs={4} sm={4} lg={4}>
					<Card variant="plain">
						<Typography variant="headline">Card variant=plain</Typography>
					</Card>
				</Grid>
			</Grid>
		</div>
	);
};

export default withStyles(styles)(ElementShowcase);
