import React from "react";
import { Typography, withStyles } from "@material-ui/core";
import { observer } from "mobx-react";

import user from "../../../../../../stores/user";
import Divider from "../../../../../common/Divider";
import Container from "../Container";
import TransactionsList from "../../../reports/transactions/Transactions";

const styles = theme => ({
	root: {}
});

const Transactions = observer(props => {
	const eventId = props.match.params.id;
	const organizationId = user.currentOrganizationId;

	return (
		<Container eventId={eventId} subheading={"reports"}>
			<div style={{ display: "flex" }}>
				<Typography variant="title">Transaction report</Typography>
				<span style={{ flex: 1 }} />
				{/* <Button
                    onClick={e => notifications.show({ message: "Coming soon." })}
                >
                    Export as CSV
                </Button> */}
			</div>

			<Divider style={{ marginBottom: 40 }} />

			{organizationId ? (
				<TransactionsList organizationId={organizationId} eventId={eventId} />
			) : (
				<Typography>Loading...</Typography>
			)}
		</Container>
	);
});

export default withStyles(styles)(Transactions);
