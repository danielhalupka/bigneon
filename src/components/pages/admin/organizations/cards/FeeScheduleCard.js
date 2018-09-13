import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Grid,
	CardActions,
	CardContent,
	Card,
	InputAdornment,
	IconButton
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../common/Button";
import notifications from "../../../../../stores/notifications";
import api from "../../../../../helpers/api";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

class FeeScheduleCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			ranges: [],
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		//TODO load in existing fee schedule
		const { organizationId } = this.props;

		api()
			.get(`/organizations/${organizationId}/fee_schedule`)
			.then(response => {
				console.log(response.data);
				//TODO set details here when API is working

				notifications.show({
					message: "Existing fee schedule found.",
					variant: "warning"
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Failed to retrieve existing fee schedule found.";

				if (error.response && error.response.status === 404) {
					message = "No existing fee schedule found.";

					//If there is not schedule, add a blank one
					this.addNewRange();
				} else if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "info"
				});
			});
	}

	addNewRange() {
		const { ranges } = this.state;
		ranges.push({ min_price: "", fee: "" });
		this.setState({ ranges });
	}

	validateFields() {
		//Don't validate every field if the user has not tried to submit at least once
		if (!this.submitAttempted) {
			return true;
		}

		const { name, ranges } = this.state;

		const errors = {};

		if (name === "") {
			errors.name = "Missing fee schedule name.";
		}

		let rangesErrors = {};
		ranges.forEach(({ min_price, fee }, index) => {
			if (!min_price || !fee) {
				rangesErrors[index] = {};

				if (!min_price) {
					rangesErrors[index].min_price = "Missing minimum price.";
				}

				if (!fee) {
					rangesErrors[index].fee = "Missing fee.";
				}
			}
		});

		if (Object.keys(rangesErrors).length > 0) {
			errors.ranges = rangesErrors;
		}

		this.setState({ errors });

		if (Object.keys(errors).length > 0) {
			return false;
		}

		return true;
	}

	onSubmit(e) {
		e.preventDefault();

		this.submitAttempted = true;

		if (!this.validateFields()) {
			return false;
		}

		const { organizationId } = this.props;
		const { name, ranges } = this.state;

		this.setState({ isSubmitting: true });

		api()
			.post(`/organizations/${organizationId}/fee_schedule`, { name, ranges })
			.then(response => {
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Fee schedule saved.",
					variant: "success"
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Saving fee schedule failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	updateMinPrice(index, min_price) {
		this.setState(({ ranges }) => {
			ranges[index].min_price = min_price;
			return { ranges };
		});
	}

	updateFee(index, fee) {
		this.setState(({ ranges }) => {
			ranges[index].fee = fee;
			return { ranges };
		});
	}

	deleteRange(index) {
		this.setState(({ ranges }) => {
			delete ranges[index];
			return { ranges };
		});
	}

	render() {
		const { name, ranges, errors, isSubmitting } = this.state;
		const { classes } = this.props;

		return (
			<Card className={classes.paper}>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<CardContent>
						<InputGroup
							error={errors.name}
							value={name}
							name="name"
							label="Fee schedule name"
							type="text"
							onChange={e => this.setState({ name: e.target.value })}
							onBlur={this.validateFields.bind(this)}
						/>

						{ranges.map(({ min_price, fee }, index) => (
							<Grid key={index} spacing={24} container alignItems={"center"}>
								<Grid item xs={12} sm={4} md={4} lg={3}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">$</InputAdornment>
											)
										}}
										error={
											errors.ranges &&
											errors.ranges[index] &&
											errors.ranges[index].min_price
										}
										value={min_price}
										name="min_price"
										label="Minimum price"
										type="number"
										onChange={e => this.updateMinPrice(index, e.target.value)}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>
								<Grid item xs={12} sm={4} md={4} lg={3}>
									<InputGroup
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">$</InputAdornment>
											)
										}}
										error={
											errors.ranges &&
											errors.ranges[index] &&
											errors.ranges[index].fee
										}
										value={fee}
										name="fee"
										label="Fee"
										type="number"
										onChange={e => this.updateFee(index, e.target.value)}
										onBlur={this.validateFields.bind(this)}
									/>
								</Grid>

								<Grid item xs={1}>
									{index > 0 ? (
										<IconButton
											onClick={e => this.deleteRange(index)}
											color="inherit"
										>
											<DeleteIcon />
										</IconButton>
									) : null}
								</Grid>
							</Grid>
						))}
					</CardContent>
					<CardActions>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.addNewRange.bind(this)}
						>
							Add new range
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							customClassName="callToAction"
						>
							{isSubmitting ? "Creating..." : "Create"}
						</Button>
					</CardActions>
				</form>
			</Card>
		);
	}
}

FeeScheduleCard.propTypes = {
	organizationId: PropTypes.string.isRequired
};

export default withStyles(styles)(FeeScheduleCard);
