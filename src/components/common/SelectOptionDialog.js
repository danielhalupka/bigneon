import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import grey from "@material-ui/core/colors/grey";

import { primaryHex } from "../styles/theme";
import Dialog from "../elements/Dialog";

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
			selectedKey,
			...other
		} = this.props;

		return (
			<Dialog
				onClose={onClose}
				{...other}
				title={heading}
			>
				<div>
					<List>
						{Object.keys(items).map(key => (
							<ListItem selected={selectedKey === key} button onClick={() => onSelect(key)} key={key}>
								{iconComponent ? (
									<ListItemAvatar>
										<Avatar className={classes.avatar}>{iconComponent}</Avatar>
									</ListItemAvatar>
								) : null}
								<ListItemText primary={items[key]}/>
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
	onSelect: PropTypes.func.isRequired,
	selectedKey: PropTypes.string
};

export default withStyles(styles)(SelectOptionDialog);
