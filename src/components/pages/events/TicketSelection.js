import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import InputGroup from "../../common/form/InputGroup";

const styles = theme => ({
	container: {
		marginTop: theme.spacing.unit * 4,
		marginBottom: theme.spacing.unit * 4
	}
});

const TicketSelection = props => {
	const {
		classes,
		error,
		name,
		description,
		price,
		amount,
		onNumberChange
	} = props;

	return (
		<Grid alignItems="center" className={classes.container} container>
			<Grid item xs={8} sm={8} md={6} lg={8}>
				<Typography variant="subheading">{name}</Typography>

				<Typography variant="caption">{description}</Typography>
			</Grid>
			<Grid item xs={2} sm={2} md={6} lg={2}>
				<Typography variant="title">${price}</Typography>
			</Grid>
			<Grid item xs={2} sm={2} md={6} lg={2} style={{ paddingTop: 10 }}>
				<InputGroup
					error={error}
					value={amount || ""}
					name="amount"
					type="number"
					onChange={e => {
						onNumberChange(Number(e.target.value));
					}}
					placeholder="0"
				/>
			</Grid>
		</Grid>
	);
};

TicketSelection.propTypes = {
	onNumberChange: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	price: PropTypes.number.isRequired,
	error: PropTypes.string,
	amount: PropTypes.number,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TicketSelection);
