import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { observer } from "mobx-react";

import Button from "../../elements/Button";
import Dialog from "../../elements/Dialog";
import selectedEvent from "../../../stores/selectedEvent";
import InputGroup from "../../common/form/InputGroup";

const styles = {
	content: {
		minWidth: 400,
		alignContent: "center",
		textAlign: "center"
	},
	actionButtons: {
		display: "flex"
	}
};

@observer
class PrivateEventDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			code: ""
		};
	}

	onSubmit(e) {
		e.preventDefault();

		const { code } = this.state;

		this.setState({ isSubmitting: true });
		selectedEvent.retryRefreshWithCode(code);
	}

	render() {
		const { classes, ...other } = this.props;
		const { isSubmitting, code } = this.state;

		const { showPrivateAccessCodeInputDialog, privateAccessCodeError } = selectedEvent;

		const iconUrl = "/icons/events-white.svg";

		return (
			<Dialog
				open={showPrivateAccessCodeInputDialog}
				iconUrl={iconUrl}
				title={"Private event access code"}
				onClose={() => this.setState({ isSubmitting: false })}
				{...other}
			>
				<form noValidate autoComplete="off" onSubmit={this.onSubmit.bind(this)}>
					<div className={classes.content}>
						<InputGroup
							error={privateAccessCodeError}
							value={code}
							name="privateAccessCode"
							label="Access code"
							placeholder=""
							type="text"
							onChange={e => this.setState({ code: e.target.value })}
						/>
					</div>

					<div className={classes.actionButtons}>
						<Button
							style={{ flex: 1 }}
							type="submit"
							variant="callToAction"
							disabled={(isSubmitting && !privateAccessCodeError) || !code}
						>
							{isSubmitting && !privateAccessCodeError ? "Validating..." : "Submit"}
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}
}

PrivateEventDialog.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PrivateEventDialog);
