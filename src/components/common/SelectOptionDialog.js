import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import grey from "@material-ui/core/colors/grey";

import { primaryHex } from "../styles/theme";
import DialogTransition from "./DialogTransition";

const styles = {
	avatar: {
		backgroundColor: grey[200],
		color: primaryHex
	}
};

class SelectOptionDialog extends React.Component {
	render() {
		const {
			items,
			heading,
			iconComponent,
			classes,
			onClose,
			onSelect,
			...other
		} = this.props;

		return (
			<Dialog
				TransitionComponent={DialogTransition}
				onClose={onClose}
				aria-labelledby="simple-dialog-title"
				{...other}
			>
				<DialogTitle id="simple-dialog-title">{heading}</DialogTitle>
				<div>
					<List>
						{Object.keys(items).map(key => (
							<ListItem button onClick={() => onSelect(key)} key={key}>
								{iconComponent ? (
									<ListItemAvatar>
										<Avatar className={classes.avatar}>{iconComponent}</Avatar>
									</ListItemAvatar>
								) : null}
								<ListItemText primary={items[key]} />
							</ListItem>
						))}
					</List>
				</div>
			</Dialog>
		);
	}
}

SelectOptionDialog.propTypes = {
	iconComponent: PropTypes.element,
	heading: PropTypes.string.isRequired,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	items: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired
};

export default withStyles(styles)(SelectOptionDialog);
