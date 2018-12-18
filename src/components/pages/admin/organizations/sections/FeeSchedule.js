import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	withStyles,
	Grid,
	InputAdornment,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import InputGroup from "../../../../common/form/InputGroup";
import Button from "../../../../elements/Button";
import DialogTransition from "../../../../common/DialogTransition";
import notifications from "../../../../../stores/notifications";
import Bigneon from "../../../../../helpers/bigneon";
import FeeRow from "./FeeRow";
import { fontFamilyDemiBold } from "../../../../styles/theme";

const styles = theme => ({
	dollarValue: {},
	tableHeading: {
		fontFamily: fontFamilyDemiBold
	},
	subHeading: {
		marginTop: theme.spacing.unit * 6,
		paddingLeft: theme.spacing.unit * 2
	}
});

const DollarValue = ({ children }) => (
	<Typography>${(children / 100).toFixed(2)}</Typography>
);

class FeeSchedule extends Component {
	constructor(props) {
		super(props);

		this.state = {
			id: "",
			name: "",
			ranges: [],
			areYouSureDialogOpen: false,
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.refreshFees();
	}

	refreshFees() {
		const { organizationId } = this.props;

		Bigneon()
			.organizations.feeSchedules.index({ organization_id: organizationId })
			.then(response => {
				const { data, paging } = response; //@TODO Implement pagination

				const { id, name, ranges, message } = data;

				let formattedRanges = [];
				ranges.forEach(range => {
					const {
						company_fee_in_cents = 0,
						client_fee_in_cents = 0,
						min_price_in_cents = 0
					} = range;

					let formattedRange = {
						...range,
						min_price: min_price_in_cents / 100,
						total_fee: (company_fee_in_cents + client_fee_in_cents) / 100,
						company_fee: company_fee_in_cents / 100,
						client_fee: client_fee_in_cents / 100
					};
					formattedRanges.push(formattedRange);
				});

				if (id) {
					this.setState({ id, name, ranges: formattedRanges });
				} else {
					this.addNewRange();
				}

				if (message) {
					notifications.show({ message });
				}

				this.refreshPerOrderFees();
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				let message = "Failed to retrieve existing fee schedule found.";

				if (error.response && error.response.status === 404) {
					message = "No existing fee schedule found.";

					//If there is not schedule, add a blank one
					this.addNewRange();
				}

				notifications.showFromErrorResponse({
					error,
					defaultMessage: message
				});
			});
	}

	refreshPerOrderFees() {
		const { organizationId } = this.props;

		Bigneon()
			.organizations.read({ id: organizationId })
			.then(response => {
				const { event_fee_in_cents } = response.data;

				this.setState({
					event_fee_in_cents
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading organization per order fees failed."
				});
			});
	}

	addNewRange() {
		const { ranges } = this.state;
		ranges.push({
			min_price: "",
			fee: "",
			company_fee: "",
			client_fee: ""
		});
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
		ranges.forEach(({ min_price, company_fee, client_fee }, index) => {
			const missingMinPrice = !min_price && min_price !== 0;
			const missingCompanyFee = !company_fee && company_fee !== 0;
			const missingClientFee = !client_fee && client_fee !== 0;

			if (missingMinPrice || missingCompanyFee || missingClientFee) {
				rangesErrors[index] = {};

				if (missingMinPrice) {
					rangesErrors[index].min_price = "Missing minimum price.";
				}

				if (missingCompanyFee) {
					rangesErrors[index].company_fee = "Missing fee.";
				}

				if (missingClientFee) {
					rangesErrors[index].client_fee = "Missing fee.";
				}
			}
			if (index > 0 && min_price <= ranges[index - 1].min_price) {
				rangesErrors[
					index
				].min_price = `Minimum price must be more than ${ranges[
					index - 1
				].min_price.toFixed(2)}`;
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

		const { id } = this.state;

		if (id) {
			return this.setState({ areYouSureDialogOpen: true });
		}

		this.saveNewFeeSchedule();
	}

	saveNewFeeSchedule() {
		if (!this.validateFields()) {
			return false;
		}

		const { organizationId } = this.props;

		const { id, name, ranges } = this.state;

		this.setState({ isSubmitting: true });
		const formattedRanges = ranges.map(
			({ min_price, client_fee, company_fee }) => ({
				min_price_in_cents: Number(min_price) * 100,
				client_fee_in_cents: Number(client_fee) * 100,
				company_fee_in_cents: Number(company_fee) * 100
			})
		);

		Bigneon()
			.organizations.feeSchedules.create({
				organization_id: organizationId,
				name,
				ranges: formattedRanges
			})
			.then(response => {
				this.onDialogClose();
				this.setState({ isSubmitting: false });

				notifications.show({
					message: "Fee schedule saved.",
					variant: "success"
				});

				this.refreshFees();
			})
			.catch(error => {
				this.onDialogClose();
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					defaultMessage: "Saving fee schedule failed.",
					error
				});
			});
	}

	updateMinPrice(index, min_price) {
		this.setState(({ ranges }) => {
			ranges[index].min_price = min_price;
			return { ranges };
		});
	}

	updateFee(index, isClient, fee) {
		this.setState(({ ranges }) => {
			let key = isClient ? "client_fee" : "company_fee";
			ranges[index][key] = fee;
			return { ranges };
		});
	}

	deleteRange(index) {
		this.setState(({ ranges }) => {
			ranges.splice(index, 1);
			return { ranges };
		});
	}

	onDialogClose() {
		this.setState({ areYouSureDialogOpen: false });
	}

	renderAreYouSureDialog() {
		const { areYouSureDialogOpen } = this.state;

		const onClose = this.onDialogClose.bind(this);

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				open={areYouSureDialogOpen}
				onClose={onClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				BackdropProps={{ style: { backgroundColor: "transparent" } }}
			>
				<DialogTitle id="alert-dialog-title">
					Are you sure you want to create this new fee schedule?
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Adding a new fee schedule archives the previous one but existing
						events will still belong to the fee schedule that was active at the
						time the event was created.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="primary"
						onClick={this.saveNewFeeSchedule.bind(this)}
						autoFocus
					>
						I Am Sure, Update Fee Schedule
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	renderForm() {
		const { name, ranges, errors, isSubmitting } = this.state;

		return (
			<div>
				{this.renderAreYouSureDialog()}
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<InputGroup
						error={errors.name}
						value={name}
						name="name"
						label="Fee schedule name"
						type="text"
						onChange={e => this.setState({ name: e.target.value })}
						onBlur={this.validateFields.bind(this)}
					/>

					{ranges.map(({ min_price, client_fee, company_fee }, index) => (
						<Grid key={index} spacing={24} container alignItems={"center"}>
							<Grid item xs={12} sm={3} md={3} lg={3}>
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
							<Grid item xs={12} sm={2} md={2} lg={2}>
								<InputGroup
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">$</InputAdornment>
										)
									}}
									disabled={true}
									value={
										ranges.length - 1 >= index + 1
											? ranges[index + 1].min_price - 0.01
											: "and up"
									}
									onChange={() => {}}
									name="max_price"
									label="Maximum price"
									type="text"
								/>
							</Grid>
							<Grid item xs={12} sm={2} md={2} lg={2}>
								<InputGroup
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">$</InputAdornment>
										)
									}}
									error={
										errors.ranges &&
										errors.ranges[index] &&
										errors.ranges[index].client_fee
									}
									value={client_fee}
									name="client_fee"
									label="Client Fee"
									type="number"
									onChange={e => this.updateFee(index, true, e.target.value)}
									onBlur={this.validateFields.bind(this)}
								/>
							</Grid>
							<Grid item xs={12} sm={2} md={2} lg={2}>
								<InputGroup
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">$</InputAdornment>
										)
									}}
									error={
										errors.ranges &&
										errors.ranges[index] &&
										errors.ranges[index].company_fee
									}
									value={company_fee}
									name="company_fee"
									label="Big Neon Fee"
									type="number"
									onChange={e => this.updateFee(index, false, e.target.value)}
									onBlur={this.validateFields.bind(this)}
								/>
							</Grid>
							<Grid item xs={12} sm={2} md={2} lg={2}>
								<InputGroup
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">$</InputAdornment>
										)
									}}
									disabled={true}
									value={(+company_fee + +client_fee).toFixed(2)}
									name="total_fee"
									label="Total Fee"
									type="number"
									onChange={() => {}}
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

					<Button
						style={{ marginRight: 10 }}
						onClick={this.addNewRange.bind(this)}
					>
						Add new range
					</Button>
					<Button disabled={isSubmitting} type="submit" variant="callToAction">
						{isSubmitting ? "Updating..." : "Update Fee Schedule"}
					</Button>
				</form>
			</div>
		);
	}

	renderDisplay() {
		const { classes } = this.props;
		const { ranges, event_fee_in_cents } = this.state;

		return (
			<div>
				<Typography>
					Fee schedules can only be modified by your account executive
				</Typography>

				<Typography className={classes.subHeading}>Per ticket fees</Typography>
				<FeeRow>
					<Typography className={classes.tableHeading}>Price (From)</Typography>
					<Typography className={classes.tableHeading}>Price (To)</Typography>
					<Typography className={classes.tableHeading}>Company</Typography>
					<Typography className={classes.tableHeading}>Client</Typography>
					<Typography className={classes.tableHeading}>Total</Typography>
				</FeeRow>
				{ranges.map((range, index) => {
					const {
						client_fee_in_cents,
						company_fee_in_cents,
						fee_in_cents,
						min_price_in_cents,

						...rest
					} = range;

					const totalCents = company_fee_in_cents + client_fee_in_cents;

					let maxPrice = false;
					const nextRange = ranges[index + 1];
					if (nextRange) {
						const { min_price_in_cents } = nextRange;
						maxPrice = min_price_in_cents - 1;
					}

					return (
						<FeeRow key={index} shaded={!(index % 2)}>
							<DollarValue>{min_price_in_cents}</DollarValue>
							{maxPrice ? (
								<DollarValue>{maxPrice}</DollarValue>
							) : (
								<Typography>and up</Typography>
							)}
							<DollarValue>{company_fee_in_cents}</DollarValue>
							<DollarValue>{client_fee_in_cents}</DollarValue>
							<DollarValue>{totalCents}</DollarValue>
						</FeeRow>
					);
				})}

				<Typography className={classes.subHeading}>Per order fees</Typography>
				<FeeRow>
					<Typography className={classes.tableHeading}>Company</Typography>
					<Typography className={classes.tableHeading}>Client</Typography>
					<Typography className={classes.tableHeading}>&nbsp;</Typography>
					<Typography className={classes.tableHeading}>&nbsp;</Typography>
					<Typography className={classes.tableHeading}>Total</Typography>
				</FeeRow>
				<FeeRow shaded>
					<DollarValue>{event_fee_in_cents}</DollarValue>
					<DollarValue>{0}</DollarValue>
					<Typography className={classes.tableHeading}>&nbsp;</Typography>
					<Typography className={classes.tableHeading}>&nbsp;</Typography>
					<DollarValue>{event_fee_in_cents}</DollarValue>
				</FeeRow>
			</div>
		);
	}

	render() {
		const { type } = this.props;

		if (type === "read-write") {
			return this.renderForm();
		}

		return this.renderDisplay();
	}
}

FeeSchedule.propTypes = {
	organizationId: PropTypes.string.isRequired,
	type: PropTypes.oneOf(["read-write", "read"]).isRequired
};

export default withStyles(styles)(FeeSchedule);
