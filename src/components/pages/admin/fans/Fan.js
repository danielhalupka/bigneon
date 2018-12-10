import React, { Component } from "react";
import { withStyles,  Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";

import InputGroup from "../../../common/form/InputGroup";
import FormSubHeading from "../../../elements/FormSubHeading";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import { validUrl } from "../../../../validators";
import cloudinaryWidget from "../../../../helpers/cloudinaryWidget";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import user from "../../../../stores/user";
import FanHistoryCard from "./FanHistoryCard";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	},
	fanImage: {
		width: "100%",
		height: 300,
		borderRadius: theme.shape.borderRadius
	}
});

class Fan extends Component {
	constructor(props) {
		super(props);

		let fanId = props.match.params.id;

		this.state = {
			fanId,
			profile: {
				
				first_name:null, last_name:null, email:null, facebook_linked: false, profile_pic_url: null, event_count: 0, revenue_in_cents: 0, ticket_sales: 0
			},
			history: []
		};
	}


	componentDidMount() {
		this.loadFan();
	}

	loadFan() {
		const organization_id = user.currentOrganizationId;

		if (!organization_id) {
			this.timeout = setTimeout(this.loadFan.bind(this), 500);
			return;
		}
		const { fanId } = this.state;
		
		let catcher  = error => {
			console.error(error);
			
			let message = "Loading fan profile  failed.";
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
		};

		Bigneon()
			.organizations.fans.read({ user_id: fanId, organization_id })
			.then(response => {
				let  profile  = response.data;
				this.setState({ profile });
				Bigneon().organizations.fans.history({ user_id:fanId, organization_id }).then( res=> {
					let history  = res.data.data;
					this.setState({ history });

				}).catch(catcher);
			})
			.catch(catcher);
	}

	render() {
		const {
			first_name, last_name, email, facebook_linked, profile_pic_url, event_count, revenue_in_cents, ticket_sales
		} = this.state.profile;
		const history = this.state.history;
		const { classes } = this.props;

		let fullName = first_name + " "+ last_name; 
		return (
			<div>
				<PageHeading iconUrl="/icons/fan-hub-active.svg">
					Fan Profile
				</PageHeading>

				<Card className={classes.paper}>
				
					<CardContent>

						<Grid container spacing={24}>
							<Grid item xs={12} sm={4} lg={4}>
								<CardMedia
									className={classes.profilePic}
									image={profile_pic_url || "/images/profile-pic-placeholder.png"}
									title={fullName}
								/>
							</Grid>
							<Grid item xs={12} sm={4} lg={4}>
								<Typography>{fullName}</Typography>
								<Typography>{email}</Typography>
								{/* <Typography>San Fran, CA (TODO: Replace)</Typography> */}
								<Typography>{facebook_linked}</Typography>
							</Grid>								
							<Grid item xs={12} sm={4} lg={4}>
								<Grid container spacing={24}>
									<Grid item xs={8} sm={8} lg={8}>
									Events
										<Typography>{event_count} </Typography> 
									</Grid>
									<Grid item xs={8} sm={8} lg={8}>
									Revenue
										<Typography>{revenue_in_cents / 100} </Typography> 

									</Grid>
									<Grid item xs={8} sm={8} lg={8}>
									Tickets
										<Typography>{ticket_sales} </Typography> 

									</Grid>
								</Grid>
							</Grid>
							<hr/>
							
							<FormSubHeading style={{ marginTop: 40 }}>
									History
							</FormSubHeading>

							<Grid item xs={12} sm={6} lg={6}>
								<Grid container>
									<Grid item>
										<Typography>Showing</Typography>
									</Grid>
									<Grid item>
										<Button>Sales</Button>
									</Grid>
									<Grid item><Button>Attendance</Button>
									</Grid>
								
								</Grid>

							</Grid>
							{ history.map((item, index)=> {
								return (
									<FanHistoryCard key={index} item={item}></FanHistoryCard>
								); })}
						</Grid>
					</CardContent>
					
				</Card>
			</div>
		);
	}
}

export default withStyles(styles)(Fan);
