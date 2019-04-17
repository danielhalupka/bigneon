import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import InputGroup from "../../../common/form/InputGroup";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Loader from "../../../elements/loaders/Loader";
import StyledLink from "../../../elements/StyledLink";
import CustomDialog from "../../../elements/Dialog";
import RegionRow from "./RegionRow";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	media: {
		width: "100%",
		maxWidth: 150,
		height: 150
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	}
});

class RegionsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			createModalActive: false,
			deleteModalActive: false,
			updateModalActive: false,
			regions: null,
			currentRegion: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.getRegions();
	}

	getRegions() {
		Bigneon()
			.regions.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ regions: data });
			})
			.catch(error => {
				let message = "Loading regions failed.";
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

	toggleModal(key, region) {
		this.setState({
			currentRegion: region,
			[key]: !this.state[key]
		});
	}

	doActionWithCurrentRegion(key, event) {
		event.preventDefault();
		const { currentRegion } = this.state;
		this.setState(
			{
				isSubmitting: true
			},
			() => {
				Bigneon()
					.regions[key](currentRegion)
					.then(response => {
						this.getRegions();
						this.setState(
							{ isSubmitting: false },
							this.toggleModal.bind(this, `${key}ModalActive`, {})
						);
					})
					.catch(error => {
						let message = "Loading regions failed.";
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
		);
	}

	renderRegions() {
		const { regions, paging, isLoading } = this.state;
		const { classes } = this.props;

		if (regions === null) {
			return <Loader/>;
		}

		if (regions.length === 0) {
			return <Typography>No regions currently.</Typography>;
		}

		return (
			<Card>
				<div className={classes.content}>
					<RegionRow>
						<Typography className={classes.heading}>ID</Typography>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Action</Typography>
					</RegionRow>
					{regions.map((region, index) => {
						const { id, name } = region;
						return (
							<RegionRow shaded={!(index % 2)} key={`region-${id}`}>
								<Typography className={classes.itemText}>{id}</Typography>
								<Typography className={classes.itemText}>{name}</Typography>
								<Typography className={classes.itemText}>
									<StyledLink
										underlined
										key={`region-update-${id}`}
										onClick={this.toggleModal.bind(
											this,
											"updateModalActive",
											region
										)}
									>
										update
									</StyledLink>
									<br/>
									{/* <StyledLink 
										underlined
										key={`region-delete-${id}`}
										onClick={this.toggleModal.bind(this,'deleteModalActive', region)}
									>
										delete
									</StyledLink> */}
								</Typography>
							</RegionRow>
						);
					})}
				</div>
			</Card>
		);
	}

	renderDeletionDialog() {
		const { deleteModalActive, currentRegion, isSubmitting } = this.state;
		return (
			<CustomDialog
				onClose={this.toggleModal.bind(this, "deleteModalActive", {})}
				open={deleteModalActive}
				title={`Delete region`}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.doActionWithCurrentRegion.bind(this, "delete")}
				>
					<div>
						<Typography>
							{`Are you sure to delete region ${currentRegion.name}?`}
						</Typography>
					</div>
					<div>
						<br/>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.toggleModal.bind(this, "deleteModalActive", {})}
							color="primary"
						>
							Keep region
						</Button>
						<Button disabled={isSubmitting} type="submit" variant="warning">
							{isSubmitting ? "Deleting..." : "Delete region"}
						</Button>
					</div>
				</form>
			</CustomDialog>
		);
	}

	renderDialog(key, loadingString) {
		const { isSubmitting, currentRegion } = this.state;
		return (
			<CustomDialog
				onClose={this.toggleModal.bind(this, `${key}ModalActive`, {})}
				iconUrl={"/icons/credit-card-white.svg"}
				open={this.state[`${key}ModalActive`]}
				title={`${key.charAt(0).toUpperCase() + key.slice(1)} region`}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.doActionWithCurrentRegion.bind(this, key)}
				>
					<InputGroup
						value={currentRegion.name}
						name="name"
						label="Region name"
						type="text"
						onChange={e =>
							this.setState({
								currentRegion: { ...currentRegion, name: e.target.value }
							})
						}
					/>

					<Button
						disabled={isSubmitting}
						type="submit"
						style={{ marginRight: 10, marginTop: 20 }}
						variant="callToAction"
					>
						{isSubmitting
							? loadingString
							: key.charAt(0).toUpperCase() + key.slice(1)}
					</Button>
				</form>
			</CustomDialog>
		);
	}

	render() {
		const { classes } = this.props;
		return (
			<div>
				{this.renderDialog("create", "Creating...")}
				{this.renderDialog("update", "Updating...")}
				{/* {this.renderDeletionDialog()} */}
				<PageHeading>Regions</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Button
							variant="callToAction"
							onClick={this.toggleModal.bind(this, "createModalActive", {})}
						>
							Create region
						</Button>
					</Grid>
				</Grid>

				<br/>

				{this.renderRegions()}
			</div>
		);
	}
}

export default withStyles(styles)(RegionsList);
