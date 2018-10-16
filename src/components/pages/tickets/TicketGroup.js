import React, { Component } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import {
	withStyles,
	ListItemSecondaryAction,
	IconButton,
	Divider
} from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import Checkbox from "@material-ui/core/Checkbox";
import QRIcon from "@material-ui/icons/Receipt";

import Button from "../../common/Button";

const styles = theme => ({
	paper: {
		width: "100%"
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	media: {
		width: "100%",
		maxWidth: 300,
		height: 180
	},
	actionButtons: {
		display: "flex",
		justifyContent: "flex-end"
	},
	ticketList: {
		width: "100%",
		backgroundColor: theme.palette.background.paper
	}
});

class TicketGroup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			checkedTicketsIds: []
		};
	}

	toggleTicketCheckbox(id) {
		const { checkedTicketsIds } = this.state;
		const currentIndex = checkedTicketsIds.indexOf(id);
		const newChecked = [...checkedTicketsIds];

		if (currentIndex === -1) {
			newChecked.push(id);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		this.setState({
			checkedTicketsIds: newChecked
		});
	}

	toggleAllTickets() {
		const { tickets } = this.props;
		const newChecked = []; //Default them all to unselected

		if (!this.allSelected()) {
			tickets.forEach(({ id, status }) => {
				const disabled = status && status !== "Purchased";

				if (!disabled) {
					newChecked.push(id);
				}
			});
		}

		this.setState({ checkedTicketsIds: newChecked });
	}

	allSelected() {
		const { tickets } = this.props;
		const { checkedTicketsIds } = this.state;

		let availableTickets = 0;
		tickets.forEach(({ status }) => {
			const disabled = status && status !== "Purchased";

			if (!disabled) {
				availableTickets++;
			}
		});

		return availableTickets === checkedTicketsIds.length;
	}

	render() {
		const {
			classes,
			event,
			tickets,
			expanded,
			onExpandedChange,
			onTicketSelect,
			onShowTransferQR
		} = this.props;
		const { checkedTicketsIds } = this.state;

		const { id, promo_image_url, formattedData, name, venue } = event;

		return (
			<ExpansionPanel
				className={classes.paper}
				expanded={expanded}
				onChange={onExpandedChange}
			>
				<ExpansionPanelSummary>
					<CardMedia
						className={classes.media}
						image={promo_image_url || "/images/event-placeholder.png"}
						title={name}
					/>

					<CardContent className={classes.cardContent}>
						<Grid container spacing={24}>
							<Grid item xs={12} sm={12} lg={12}>
								<Typography component="h2" variant="headline">
									{name}
								</Typography>
								<Typography variant="subheading">{formattedData}</Typography>
								<Typography variant="subheading">{venue.address}</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<div className={classes.ticketList}>
						<List component="nav">
							<ListItem
								style={{
									display: "flex",
									justifyContent: "flex-end",
									alignContent: "flex-end"
								}}
							>
								<span />
								<ListItemText primary={"Select all tickets"} />
								<ListItemSecondaryAction>
									<Checkbox
										onChange={this.toggleAllTickets.bind(this)}
										checked={this.allSelected()}
									/>
								</ListItemSecondaryAction>
							</ListItem>

							{tickets.map((ticket, index) => {
								const { id, ticket_type_name, status } = ticket;

								const disabled = status && status !== "Purchased";

								return (
									<span key={id}>
										<Divider />
										<ListItem
											disabled={disabled}
											button
											onClick={() => this.toggleTicketCheckbox(id)}
										>
											<IconButton
												onClick={() => onTicketSelect(ticket)}
												aria-label="QR code"
											>
												<Avatar>
													<QRIcon />
												</Avatar>
											</IconButton>
											<ListItemText
												primary={`${ticket_type_name} (${index + 1})`}
												secondary={`#${id.slice(-8)}`}
											/>
											<ListItemSecondaryAction>
												<Checkbox
													disabled={disabled}
													onChange={() => this.toggleTicketCheckbox(id)}
													checked={checkedTicketsIds.indexOf(id) !== -1}
												/>
											</ListItemSecondaryAction>
										</ListItem>
									</span>
								);
							})}
						</List>

						<div className={classes.actionButtons}>
							<Button
								target="_blank"
								href={`/events/${id}`}
								customClassName="secondary"
								style={{ marginRight: 10 }}
							>
								View event page
							</Button>
							<Button
								customClassName="callToAction"
								disabled={checkedTicketsIds.length < 1}
								onClick={() => onShowTransferQR(checkedTicketsIds)}
							>
								Transfer ticket
								{checkedTicketsIds.length > 1 ? "s" : ""}
							</Button>
						</div>
					</div>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		);
	}
}

TicketGroup.propTypes = {
	id: PropTypes.string,
	classes: PropTypes.object.isRequired,
	event: PropTypes.object.isRequired,
	tickets: PropTypes.array.isRequired,
	expanded: PropTypes.bool.isRequired,
	onExpandedChange: PropTypes.func.isRequired,
	onTicketSelect: PropTypes.func.isRequired,
	onShowTransferQR: PropTypes.func.isRequired
};

export default withStyles(styles)(TicketGroup);
