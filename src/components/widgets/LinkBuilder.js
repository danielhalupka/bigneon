import React, { Component } from "react";
import { Typography, withStyles, Card } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { observer } from "mobx-react";

import selectedEvent from "../../stores/selectedEvent";
import DefaultTemplate from "./templates/Default";
import InputGroup from "../common/form/InputGroup";
import SelectGroup from "../common/form/SelectGroup";

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit,
		marginBottom: theme.spacing.unit
	}
});

@observer
class WidgetLinkBuilder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			type: "default",
			width: "300",
			height: "400",
			numberWidth: 300,
			numberHeight: 400,
			errors: {}
		};

		//TODO put these limits inside the actual template files to be set in once place
		this.sizeLimits = {
			default: {
				lower: { width: 250, height: 400 },
				upper: { width: 800, height: 1000 }
			}
		};
	}

	componentDidMount() {
		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				console.warn(errorMessage);

				this.setState({ notFoundMessage: errorMessage });
			});
		} else {
			this.setState({ notFoundMessage: "No event found." });
		}
	}

	adjustSize(unit, value) {
		const { errors, type } = this.state;

		const lowerLimit = this.sizeLimits[type].lower[unit];
		const upperLimit = this.sizeLimits[type].upper[unit];

		let numberValue = Number(value);
		if (value < lowerLimit) {
			numberValue = lowerLimit;
			errors[unit] = `Minimum is ${lowerLimit}px`;
		} else if (value > upperLimit) {
			numberValue = upperLimit;
			errors[unit] = `Maximum is ${upperLimit}px`;
		} else {
			errors[unit] = undefined;
		}

		if (unit === "height") {
			this.setState({ height: value, numberHeight: numberValue, errors });
		}

		if (unit === "width") {
			this.setState({ width: value, numberWidth: numberValue, errors });
		}
	}

	renderPreview() {
		const { event, id } = selectedEvent;
		const { type, numberHeight } = this.state;

		if (!event) {
			return null;
		}

		switch (type) {
			case "default":
				return <DefaultTemplate height={numberHeight} {...selectedEvent} />;
			default:
				return <DefaultTemplate height={numberHeight} {...selectedEvent} />;
		}
	}

	renderForm() {
		const { type, height, width, errors } = this.state;

		const { classes } = this.props;

		const typeObj = { default: "Default" };

		return (
			<Grid container spacing={24}>
				<Grid item xs={12} sm={6} lg={4}>
					<InputGroup
						error={errors.height}
						value={height}
						name="height"
						label="Widget height"
						type="number"
						onChange={e => this.adjustSize("height", e.target.value)}
					/>
				</Grid>

				<Grid item xs={12} sm={6} lg={4}>
					<InputGroup
						error={errors.width}
						value={width}
						name="width"
						label="Widget width"
						type="number"
						onChange={e => this.adjustSize("width", e.target.value)}
					/>
				</Grid>

				<Grid item xs={12} sm={6} lg={4}>
					<SelectGroup
						value={type}
						items={typeObj}
						name={"widget_type"}
						label={"Type"}
						onChange={e => {
							const type = e.target.value;
							this.setState({ type });
						}}
					/>
				</Grid>
			</Grid>
		);
	}

	render() {
		const { type, numberWidth, numberHeight } = this.state;
		const { classes } = this.props;
		const { event, id } = selectedEvent;

		return (
			<div>
				<Typography variant="display3">Widget builder</Typography>
				<Typography variant="title">{event ? event.name : ""}</Typography>
				<br />
				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={10}>
						<Card className={classes.paper}>{this.renderForm()}</Card>
					</Grid>

					<Grid item xs={12} sm={12} lg={10}>
						<Card className={classes.paper}>
							<Typography variant="title">Copy the below code:</Typography>
							<br />
							<Typography>
								{`<iframe frameborder=0 height="${numberHeight}px" width="${numberWidth}px" src="http://localhost:3000/widget/embed/${id}?type=${type}"></iframe>`}
							</Typography>
						</Card>
					</Grid>

					<Grid item xs={12} sm={12} lg={12}>
						<Card style={{ width: numberWidth, height: numberHeight }}>
							{this.renderPreview()}
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default withStyles(styles)(WidgetLinkBuilder);
